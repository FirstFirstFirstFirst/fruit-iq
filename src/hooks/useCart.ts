import { useState, useCallback, useMemo } from 'react'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

export interface CartItem {
  id: string
  fruitId: number
  fruitName: string
  emoji: string
  weight: number
  pricePerKg: number
  subtotal: number
}

interface AddCartItemParams {
  fruitId: number
  fruitName: string
  emoji: string
  weight: number
  pricePerKg: number
}

interface UseCartReturn {
  items: CartItem[]
  addItem: (params: AddCartItemParams) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number
  itemCount: number
  isEmpty: boolean
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((params: AddCartItemParams) => {
    const newItem: CartItem = {
      id: uuidv4(),
      fruitId: params.fruitId,
      fruitName: params.fruitName,
      emoji: params.emoji,
      weight: params.weight,
      pricePerKg: params.pricePerKg,
      subtotal: params.weight * params.pricePerKg,
    }
    setItems((prev) => [...prev, newItem])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  )

  const itemCount = items.length

  const isEmpty = items.length === 0

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    total,
    itemCount,
    isEmpty,
  }
}
