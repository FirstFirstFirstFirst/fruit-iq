import { useState, useEffect } from 'react'
import { db } from '../lib/database'

export function useDailySummary(date?: string) {
  const today = date || new Date().toISOString().split('T')[0]
  const [summary, setSummary] = useState({
    date: today,
    totalTransactions: 0,
    totalRevenue: 0,
    topFruitId: null as number | null,
    createdAt: null as string | null
  })
  
  useEffect(() => {
    const store = db.getStore()
    const row = store.getRow('dailySummaries', today)
    
    if (!row) {
      setSummary({
        date: today,
        totalTransactions: 0,
        totalRevenue: 0,
        topFruitId: null,
        createdAt: null
      })
    } else {
      setSummary({
        date: today,
        totalTransactions: row.totalTransactions as number,
        totalRevenue: row.totalRevenue as number,
        topFruitId: row.topFruitId as number | null,
        createdAt: row.createdAt as string
      })
    }
    
    const listener = store.addRowListener('dailySummaries', today, () => {
      const updatedRow = store.getRow('dailySummaries', today)
      if (updatedRow) {
        setSummary({
          date: today,
          totalTransactions: updatedRow.totalTransactions as number,
          totalRevenue: updatedRow.totalRevenue as number,
          topFruitId: updatedRow.topFruitId as number | null,
          createdAt: updatedRow.createdAt as string
        })
      }
    })
    
    return () => {
      store.delListener(listener)
    }
  }, [today])
  
  return summary
}

export function useTodaysSummary() {
  return useDailySummary()
}