import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductImage } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  cartItems: CartItem[] // Added cartItems property
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  syncCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      // Helper function to calculate totals
      const calculateTotals = (items: CartItem[]) => {
        return {
          totalItems: items.reduce((sum, item) => {
            if (!item || typeof item.quantity !== 'number') return sum;
            return sum + item.quantity;
          }, 0),
          totalPrice: items.reduce((sum, item) => {
            if (!item || !item.product || typeof item.product.price !== 'number' || typeof item.quantity !== 'number') return sum;
            return sum + (item.product.price * item.quantity);
          }, 0)
        };
      };

      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        cartItems: [], // Initialize cartItems

        addItem: (product, quantity = 1) => {
          const items = get().items
          const existingItem = items.find(i => i?.product?.id === product.id)

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
              i?.product?.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )

            const { totalItems, totalPrice } = calculateTotals(updatedItems);
            set({ items: updatedItems, totalItems, totalPrice, cartItems: updatedItems }); // Update cartItems
          } else {
            const newItem: CartItem = {
              id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              product: { 
                ...product, 
                images: formattedImages, 
                category: typeof product.category === 'string' ? product.category : product.category?.name || 'Uncategorized' // Convert category to string
              },
              quantity
            };

            const updatedItems = [...items, newItem];
            const { totalItems, totalPrice } = calculateTotals(updatedItems);
            set({ items: updatedItems, totalItems, totalPrice, cartItems: updatedItems }); // Update cartItems
          }
        },

        removeItem: (productId) => {
          const items = get().items.filter(i => i?.product?.id !== productId);
          const { totalItems, totalPrice } = calculateTotals(items);
          set({ items, totalItems, totalPrice, cartItems: items }); // Update cartItems
        },

        updateQuantity: (productId, quantity) => {
          const items = get().items.map(i =>
            i?.product?.id === productId
              ? { ...i, quantity }
              : i
          );
          const { totalItems, totalPrice } = calculateTotals(items);
          set({ items, totalItems, totalPrice, cartItems: items }); // Update cartItems
        },

        clearCart: () => {
          set({ items: [], totalItems: 0, totalPrice: 0, cartItems: [] }); // Clear cartItems
        },

        syncCart: () => {
          const items = get().items;
          const { totalItems, totalPrice } = calculateTotals(items);
          set({ totalItems, totalPrice, cartItems: items }); // Sync cartItems
        }
      };
    },
    {
      name: 'cart-storage',
    }
  )
)