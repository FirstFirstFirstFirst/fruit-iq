import { useCallback, useState, useEffect } from 'react'
import { db, Fruit } from '../lib/database'
import { PHUKET_FRUITS } from '../lib/constants'

export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([])
  
  useEffect(() => {
    const store = db.getStore()
    
    const updateFruits = () => {
      const fruitIds = store.getRowIds('fruits')
      const fruitList = fruitIds.map(id => {
        const row = store.getRow('fruits', id)
        return {
          id: parseInt(id),
          nameThai: row?.nameThai as string,
          nameEnglish: row?.nameEnglish as string,
          pricePerKg: row?.pricePerKg as number,
          isActive: row?.isActive as boolean,
          createdAt: row?.createdAt as string
        }
      }).filter(fruit => fruit.isActive)
      
      setFruits(fruitList)
    }
    
    // Initial load
    updateFruits()
    
    // Listen for changes
    const listener = store.addListener('fruits', updateFruits)
    
    return () => {
      store.delListener(listener)
    }
  }, [])

  const addFruit = useCallback(async (fruit: Omit<Fruit, 'id' | 'createdAt'>) => {
    return await db.addFruit(fruit)
  }, [])

  const updateFruit = useCallback(async (id: number, updates: Partial<Fruit>) => {
    return await db.updateFruit(id, updates)
  }, [])

  const initializeWithPresets = useCallback(async () => {
    // Check if we already have fruits
    if (fruits.length > 0) return

    // Add Phuket fruit presets
    for (const preset of PHUKET_FRUITS) {
      await db.addFruit({
        nameThai: preset.nameThai,
        nameEnglish: preset.nameEnglish,
        pricePerKg: preset.defaultPrice,
        isActive: true
      })
    }
  }, [fruits.length])

  return {
    fruits,
    addFruit,
    updateFruit,
    initializeWithPresets
  }
}

export function useFruit(id: string) {
  const [fruit, setFruit] = useState<Fruit | null>(null)
  
  useEffect(() => {
    const store = db.getStore()
    const row = store.getRow('fruits', id)
    
    if (!row) {
      setFruit(null)
      return
    }
    
    setFruit({
      id: parseInt(id),
      nameThai: row.nameThai as string,
      nameEnglish: row.nameEnglish as string,
      pricePerKg: row.pricePerKg as number,
      isActive: row.isActive as boolean,
      createdAt: row.createdAt as string
    })
    
    const listener = store.addRowListener('fruits', id, () => {
      const updatedRow = store.getRow('fruits', id)
      if (updatedRow) {
        setFruit({
          id: parseInt(id),
          nameThai: updatedRow.nameThai as string,
          nameEnglish: updatedRow.nameEnglish as string,
          pricePerKg: updatedRow.pricePerKg as number,
          isActive: updatedRow.isActive as boolean,
          createdAt: updatedRow.createdAt as string
        })
      } else {
        setFruit(null)
      }
    })
    
    return () => {
      store.delListener(listener)
    }
  }, [id])
  
  return fruit
}