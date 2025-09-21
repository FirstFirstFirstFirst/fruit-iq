import { useState } from 'react'
import { Fruit } from '../data/mockData'

export function useFruitForm() {
  const [showAddFruit, setShowAddFruit] = useState(false)
  const [newFruitName, setNewFruitName] = useState('')
  const [newFruitPrice, setNewFruitPrice] = useState('')
  const [newFruitEmoji, setNewFruitEmoji] = useState('')
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [contextMenuFruit, setContextMenuFruit] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const resetFruitForm = () => {
    setNewFruitName('')
    setNewFruitPrice('')
    setNewFruitEmoji('')
    setEditingFruit(null)
    setShowEmojiPicker(false)
  }

  const closeAllModals = () => {
    setShowAddFruit(false)
    setShowDeleteConfirm(null)
    setContextMenuFruit(null)
    setShowEmojiPicker(false)
    resetFruitForm()
  }

  const startEditFruit = (fruit: Fruit) => {
    setEditingFruit(fruit)
    setNewFruitName(fruit.nameThai)
    setNewFruitPrice(fruit.pricePerKg.toString())
    setNewFruitEmoji(fruit.emoji)
    setShowAddFruit(true)
  }

  const isFormValid = () => {
    return !!(
      newFruitName?.trim() &&
      newFruitPrice?.trim() &&
      newFruitEmoji?.trim()
    )
  }

  const getParsedPrice = () => {
    const price = parseFloat(newFruitPrice)
    return { price, isValid: !isNaN(price) && price > 0 }
  }

  return {
    // State
    showAddFruit,
    newFruitName,
    newFruitPrice,
    newFruitEmoji,
    editingFruit,
    showDeleteConfirm,
    contextMenuFruit,
    showEmojiPicker,

    // Setters
    setShowAddFruit,
    setNewFruitName,
    setNewFruitPrice,
    setNewFruitEmoji,
    setEditingFruit,
    setShowDeleteConfirm,
    setContextMenuFruit,
    setShowEmojiPicker,

    // Actions
    resetFruitForm,
    closeAllModals,
    startEditFruit,
    isFormValid,
    getParsedPrice,
  }
}