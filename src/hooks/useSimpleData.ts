import { useState } from 'react'
import { MOCK_FRUITS, MOCK_TRANSACTIONS, Fruit, Transaction } from '../data/mockData'

// Simple state management hooks replacing database complexity
export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>(MOCK_FRUITS)
  
  const addFruit = (fruitData: Omit<Fruit, 'id'>) => {
    const newFruit: Fruit = {
      id: Date.now(),
      ...fruitData
    }
    setFruits(prev => [...prev, newFruit])
    return newFruit
  }
  
  const updateFruit = (id: number, fruitData: Partial<Omit<Fruit, 'id'>>) => {
    setFruits(prev => prev.map(fruit => 
      fruit.id === id ? { ...fruit, ...fruitData } : fruit
    ))
  }
  
  return { 
    fruits, 
    addFruit, 
    updateFruit 
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...transactionData
    }
    
    setTransactions(prev => [newTransaction, ...prev])
    return newTransaction
  }
  
  const getTransactionsWithFruits = () => {
    return transactions.map(transaction => ({
      ...transaction,
      fruit: MOCK_FRUITS.find(f => f.id === transaction.fruitId)
    }))
  }
  
  return {
    transactions: getTransactionsWithFruits(),
    addTransaction
  }
}