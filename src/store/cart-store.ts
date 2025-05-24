import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductImage } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      // Helper function to calculate totals
      const calculateTotals = (items: CartItem[]) => {
        return {
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        };
      };
      
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        
        addItem: (product, quantity = 1) => {
          const items = get().items
          const existingItem = items.find(i => i.product.id === product.id)
          
          // Format images to be compatible with CartItem
          const formattedImages: ProductImage[] = Array.isArray(product.images) 
            ? product.images.map(img => {
                // Handle both string[] and ProductImage[]
                if (typeof img === 'string') {
                  return { id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, url: img };
                } else {
                  return img;
                }
              })
            : [];
          
          if (existingItem) {
            const updatedItems = items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
            
            const { totalItems, totalPrice } = calculateTotals(updatedItems);
            set({ items: updatedItems, totalItems, totalPrice })
          } else {
            const newItem: CartItem = {
              id: `cart-${product.id}-${Date.now()}`,
              quantity,
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                images: formattedImages,
                stock: product.stock,
                slug: product.slug
              }
            }
            const newItems = [...items, newItem]
            
            const { totalItems, totalPrice } = calculateTotals(newItems);
            set({ items: newItems, totalItems, totalPrice })
          }
        },
      
        removeItem: (productId) => {
          const newItems = get().items.filter(i => i.product.id !== productId)
          
          const { totalItems, totalPrice } = calculateTotals(newItems);
          set({ items: newItems, totalItems, totalPrice })
        },
        
        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId)
            return
          }
          
          const updatedItems = get().items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          )
          
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice })
        },
        
        clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 })
      };
    },
    {
      name: 'cart-storage',
    }
  )
)