import { useCallback, useState, useEffect } from 'react'
import { db, Transaction } from '../lib/database'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  useEffect(() => {
    const store = db.getStore()
    
    const updateTransactions = () => {
      const transactionIds = store.getRowIds('transactions')
      const transactionList = transactionIds.map(id => {
        const row = store.getRow('transactions', id)
        return {
          id: parseInt(id),
          fruitId: row?.fruitId as number,
          weightKg: row?.weightKg as number,
          pricePerKg: row?.pricePerKg as number,
          totalAmount: row?.totalAmount as number,
          photoPath: row?.photoPath as string,
          qrCodeData: row?.qrCodeData as string,
          createdAt: row?.createdAt as string,
          syncedAt: row?.syncedAt as string
        }
      })
      
      setTransactions(transactionList)
    }
    
    // Initial load
    updateTransactions()
    
    // Listen for changes
    const listener = store.addListener('transactions', updateTransactions)
    
    return () => {
      store.delListener(listener)
    }
  }, [])

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    return await db.addTransaction(transaction)
  }, [])

  // Get transactions for today
  const todaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt).toDateString()
    const today = new Date().toDateString()
    return transactionDate === today
  })

  // Calculate today's totals
  const todaysTotals = todaysTransactions.reduce(
    (acc, transaction) => ({
      count: acc.count + 1,
      revenue: acc.revenue + transaction.totalAmount,
      weight: acc.weight + transaction.weightKg
    }),
    { count: 0, revenue: 0, weight: 0 }
  )

  return {
    transactions,
    todaysTransactions,
    todaysTotals,
    addTransaction
  }
}

export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  
  useEffect(() => {
    const store = db.getStore()
    const row = store.getRow('transactions', id)
    
    if (!row) {
      setTransaction(null)
      return
    }
    
    setTransaction({
      id: parseInt(id),
      fruitId: row.fruitId as number,
      weightKg: row.weightKg as number,
      pricePerKg: row.pricePerKg as number,
      totalAmount: row.totalAmount as number,
      photoPath: row.photoPath as string,
      qrCodeData: row.qrCodeData as string,
      createdAt: row.createdAt as string,
      syncedAt: row.syncedAt as string
    })
    
    const listener = store.addRowListener('transactions', id, () => {
      const updatedRow = store.getRow('transactions', id)
      if (updatedRow) {
        setTransaction({
          id: parseInt(id),
          fruitId: updatedRow.fruitId as number,
          weightKg: updatedRow.weightKg as number,
          pricePerKg: updatedRow.pricePerKg as number,
          totalAmount: updatedRow.totalAmount as number,
          photoPath: updatedRow.photoPath as string,
          qrCodeData: updatedRow.qrCodeData as string,
          createdAt: updatedRow.createdAt as string,
          syncedAt: updatedRow.syncedAt as string
        })
      } else {
        setTransaction(null)
      }
    })
    
    return () => {
      store.delListener(listener)
    }
  }, [id])
  
  return transaction
}