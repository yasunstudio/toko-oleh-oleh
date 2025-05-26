'use client'

import { useEffect, useCallback, useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { CartItem } from '@/types'

interface CartSyncResponse {
  success: boolean
  cart?: CartItem[]
  error?: string
}

export function useCartSync() {
  const { items, clearCart, addItem, updateQuantity, removeItem } = useCartStore()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const isAuthenticated = !!session
  const user = session?.user

  // Add loading state since cart store doesn't have it
  const [isLoading, setIsLoading] = useState(false)

  // Sync cart with server when user is authenticated
  const syncCartWithServer = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setIsLoading(true)
    try {
      // Get server cart
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const serverCart: CartSyncResponse = await response.json()
        
        if (serverCart.success && serverCart.cart) {
          // Get local cart from localStorage
          const localCartString = localStorage.getItem('cart-storage')
          let localCart: CartItem[] = []
          
          if (localCartString) {
            try {
              const parsed = JSON.parse(localCartString)
              localCart = parsed.state?.items || []
            } catch (error) {
              console.error('Error parsing local cart:', error)
            }
          }

          // Merge carts (prioritize local cart for conflicts)
          const mergedCart = mergeCartItems(localCart, serverCart.cart)

          // Update both local storage and server
          if (mergedCart.length > 0) {
            await updateServerCart(mergedCart)
            // Clear current cart and add merged items
            clearCart()
            mergedCart.forEach(item => {
              // Create a full Product object for addItem
              const fullProduct = {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                stock: item.product.stock,
                images: item.product.images,
                slug: item.product.slug,
                isActive: true,
                categoryId: '',
                description: '',
                weight: null,
              }
              addItem(fullProduct, item.quantity)
            })
          } else {
            clearCart()
          }
        }
      }
    } catch (error) {
      console.error('Error syncing cart:', error)
      toast({
        title: 'Peringatan',
        description: 'Gagal sinkronisasi keranjang belanja',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, clearCart, addItem, toast])

  // Update server cart
  const updateServerCart = useCallback(async (cartItems: CartItem[]) => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        console.error('Failed to update server cart')
      }
    } catch (error) {
      console.error('Error updating server cart:', error)
    }
  }, [isAuthenticated])

  // Sync local cart changes to server
  const syncLocalChangesToServer = useCallback(async () => {
    if (!isAuthenticated || isLoading) return

    try {
      await updateServerCart(items)
    } catch (error) {
      console.error('Error syncing local changes to server:', error)
    }
  }, [isAuthenticated, isLoading, items, updateServerCart])

  // Clear both local and server cart
  const clearAllCart = useCallback(async () => {
    setIsLoading(true)
    try {
      // Clear local cart
      clearCart()

      // Clear server cart if authenticated
      if (isAuthenticated) {
        await updateServerCart([])
      }
      
      toast({
        title: 'Berhasil',
        description: 'Keranjang belanja telah dikosongkan',
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengosongkan keranjang belanja',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [clearCart, isAuthenticated, updateServerCart, toast])

  // Merge cart items (local takes priority for quantity conflicts)
  const mergeCartItems = (localCart: CartItem[], serverCart: CartItem[]): CartItem[] => {
    const merged = new Map<string, CartItem>()

    // Add server items first
    serverCart.forEach(item => {
      merged.set(item.product.id, item)
    })

    // Add/override with local items
    localCart.forEach(item => {
      const existing = merged.get(item.product.id)
      if (existing) {
        // Use local quantity if different
        merged.set(item.product.id, {
          ...existing,
          quantity: item.quantity,
        })
      } else {
        merged.set(item.product.id, item)
      }
    })

    return Array.from(merged.values())
  }

  // Validate cart items (check stock, prices, etc.)
  const validateCartItems = useCallback(async () => {
    if (items.length === 0) return

    setIsLoading(true)
    try {
      const productIds = items.map(item => item.product.id)
      const response = await fetch('/api/products/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      })

      if (response.ok) {
        const { products } = await response.json()
        let hasChanges = false

        for (const item of items) {
          const product = products.find((p: any) => p.id === item.product.id)
          if (product) {
            // Check if product is still available
            if (product.stock === 0) {
              hasChanges = true
              removeItem(item.product.id)
              toast({
                title: 'Produk Tidak Tersedia',
                description: `${product.name} telah habis dan dihapus dari keranjang`,
                variant: 'destructive',
              })
              continue
            }

            // Check if quantity exceeds stock
            const maxQuantity = Math.min(item.quantity, product.stock)
            if (maxQuantity !== item.quantity) {
              hasChanges = true
              updateQuantity(item.product.id, maxQuantity)
              toast({
                title: 'Kuantitas Disesuaikan',
                description: `${product.name} disesuaikan menjadi ${maxQuantity} item`,
              })
            }

            // Check if price has changed
            if (product.price !== item.product.price) {
              hasChanges = true
              toast({
                title: 'Harga Berubah',
                description: `Harga ${product.name} telah diperbarui`,
              })
              // Remove and re-add item with updated product info
              removeItem(item.product.id)
              addItem({
                id: item.product.id,
                name: item.product.name,
                price: product.price,
                stock: product.stock,
                images: item.product.images,
                slug: item.product.slug,
                isActive: true,
                categoryId: product.categoryId || '',
                description: product.description,
                weight: product.weight,
              }, maxQuantity)
            }
          }
        }

        if (hasChanges && isAuthenticated) {
          // Sync updated cart to server
          await updateServerCart(useCartStore.getState().items)
        }
      }
    } catch (error) {
      console.error('Error validating cart items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [items, isAuthenticated, removeItem, updateQuantity, addItem, toast, updateServerCart])

  // Effects
  useEffect(() => {
    // Sync with server when user logs in
    if (isAuthenticated && user) {
      syncCartWithServer()
    }
  }, [isAuthenticated, user, syncCartWithServer])

  useEffect(() => {
    // Sync local changes to server (debounced)
    const timeoutId = setTimeout(() => {
      if (isAuthenticated && items.length > 0) {
        syncLocalChangesToServer()
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [items, syncLocalChangesToServer, isAuthenticated])

  return {
    syncCartWithServer,
    clearAllCart,
    validateCartItems,
    isLoading,
  }
}