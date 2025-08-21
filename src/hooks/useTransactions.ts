import { useState, useEffect } from 'react';
import { db, type Transaction, type DailySummary } from '~/lib/database';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todaysSummary, setTodaysSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTodaysData = async () => {
    try {
      const todaysTransactions = db.getTodaysTransactions();
      const summary = db.getTodaysSummary();
      
      setTransactions(todaysTransactions);
      setTodaysSummary(summary);
    } catch (error) {
      console.error('Error loading today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: {
    fruit_id: number;
    weight_kg: number;
    price_per_kg: number;
    total_amount: number;
    photo_path?: string;
    qr_code_data?: string;
  }) => {
    try {
      const id = db.addTransaction(transaction);
      await loadTodaysData(); // Refresh data including summary
      return id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const getTransactionsByDate = (date: string): Transaction[] => {
    try {
      return db.getTransactionsByDate(date);
    } catch (error) {
      console.error('Error getting transactions by date:', error);
      return [];
    }
  };

  const getDailySummary = (date: string): DailySummary | null => {
    try {
      return db.getDailySummary(date);
    } catch (error) {
      console.error('Error getting daily summary:', error);
      return null;
    }
  };

  const getTodaysRevenue = (): number => {
    return todaysSummary?.total_revenue || 0;
  };

  const getTodaysTransactionCount = (): number => {
    return todaysSummary?.total_transactions || 0;
  };

  useEffect(() => {
    loadTodaysData();
  }, []);

  return {
    transactions,
    todaysSummary,
    loading,
    addTransaction,
    getTransactionsByDate,
    getDailySummary,
    getTodaysRevenue,
    getTodaysTransactionCount,
    refresh: loadTodaysData,
  };
}