/**
 * Database-powered React hooks for WeighPay app
 * Replaces simple state management with SQLite persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { fruitsDB, transactionsDB, settingsDB, initializeDatabase, seedInitialData } from '../lib/database';
import { Fruit, Transaction } from '../data/mockData';

// Global refresh trigger for cross-hook communication
let globalRefreshCounter = 0;
const refreshListeners: ((counter: number) => void)[] = [];

export const triggerGlobalRefresh = () => {
  globalRefreshCounter++;
  console.log(`Global refresh triggered: ${globalRefreshCounter}`);
  refreshListeners.forEach(listener => listener(globalRefreshCounter));
};

export const useGlobalRefresh = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const listener = (counter: number) => setRefreshTrigger(counter);
    refreshListeners.push(listener);
    
    return () => {
      const index = refreshListeners.indexOf(listener);
      if (index > -1) {
        refreshListeners.splice(index, 1);
      }
    };
  }, []);

  return refreshTrigger;
};

// Database initialization hook
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();
        await seedInitialData();
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Database initialization failed';
        console.error('Database initialization error:', {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(errorMessage);
      }
    }

    setup();
  }, []);

  return { isInitialized, error };
}

// Fruits management hook
export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFruits = useCallback(async () => {
    try {
      setLoading(true);
      const loadedFruits = await fruitsDB.getAllFruits();
      setFruits(loadedFruits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fruits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFruits();
  }, [loadFruits]);

  const addFruit = useCallback(async (fruitData: Omit<Fruit, 'id'>): Promise<Fruit> => {
    try {
      const newFruit = await fruitsDB.addFruit(fruitData);
      setFruits(prev => [...prev, newFruit]);
      return newFruit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fruit');
      throw err;
    }
  }, []);

  const updateFruit = useCallback(async (id: number, updates: Partial<Omit<Fruit, 'id'>>) => {
    try {
      await fruitsDB.updateFruit(id, updates);
      await loadFruits(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fruit');
      throw err;
    }
  }, [loadFruits]);

  const deleteFruit = useCallback(async (id: number) => {
    try {
      await fruitsDB.deleteFruit(id);
      setFruits(prev => prev.filter(fruit => fruit.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fruit');
      throw err;
    }
  }, []);

  return {
    fruits,
    loading,
    error,
    addFruit,
    updateFruit,
    deleteFruit,
    refreshFruits: loadFruits
  };
}

// Transactions management hook
export function useTransactions() {
  const [transactions, setTransactions] = useState<(Transaction & { fruit?: Fruit })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const loadedTransactions = await transactionsDB.getAllTransactions();
      setTransactions(loadedTransactions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (
    transactionData: Omit<Transaction, 'id' | 'timestamp'> & {
      qrCodeData?: string;
      promptpayPhone?: string;
      isSaved?: boolean;
    }
  ): Promise<Transaction> => {
    try {
      const newTransaction = await transactionsDB.addTransaction(transactionData);
      await loadTransactions(); // Reload to get updated data with fruit details
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, [loadTransactions]);

  const markTransactionAsSaved = useCallback(async (id: number) => {
    try {
      console.log(`Marking transaction ${id} as saved...`);
      await transactionsDB.markTransactionAsSaved(id);
      
      // Update local state immediately
      setTransactions(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, isSaved: true } : t);
        console.log(`Transaction ${id} updated in local state. isSaved = ${updated.find(t => t.id === id)?.isSaved}`);
        return updated;
      });
      
      // Trigger global refresh to update other hooks (like useDailySales)
      triggerGlobalRefresh();
      
      console.log(`Transaction ${id} successfully marked as saved and global refresh triggered`);
    } catch (err) {
      console.error(`Error marking transaction ${id} as saved:`, err);
      setError(err instanceof Error ? err.message : 'Failed to mark transaction as saved');
      throw err;
    }
  }, []);

  const getDailySummary = useCallback(async (date: string) => {
    try {
      return await transactionsDB.getDailySummary(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get daily summary');
      throw err;
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    markTransactionAsSaved,
    getDailySummary,
    refreshTransactions: loadTransactions
  };
}

// Settings management hook
export function useSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSetting = useCallback(async (key: string): Promise<string | null> => {
    try {
      setLoading(true);
      const value = await settingsDB.getSetting(key);
      setError(null);
      return value;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get setting');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setSetting = useCallback(async (key: string, value: string) => {
    try {
      setLoading(true);
      await settingsDB.setSetting(key, value);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set setting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Specific setting hooks
  const [promptpayPhone, setPromptpayPhoneState] = useState<string | null>(null);
  
  const getPromptpayPhone = useCallback(async () => {
    const phone = await getSetting('promptpay_phone');
    setPromptpayPhoneState(phone);
    return phone;
  }, [getSetting]);

  const setPromptpayPhone = useCallback(async (phone: string) => {
    await setSetting('promptpay_phone', phone);
    setPromptpayPhoneState(phone);
  }, [setSetting]);

  useEffect(() => {
    getPromptpayPhone();
  }, [getPromptpayPhone]);

  return {
    loading,
    error,
    getSetting,
    setSetting,
    promptpayPhone,
    getPromptpayPhone,
    setPromptpayPhone
  };
}

// Daily sales dashboard hook
export function useDailySales(date?: string, refreshTrigger?: number) {
  const [summary, setSummary] = useState<{
    totalTransactions: number;
    totalRevenue: number;
    topFruit?: Fruit;
  }>({
    totalTransactions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || new Date().toISOString().split('T')[0];

  const loadSummary = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log(`Loading daily summary for date: ${targetDate}`);
      const data = await transactionsDB.getDailySummary(targetDate);
      setSummary(data);
      setError(null);
      console.log(`Daily summary loaded:`, data);
    } catch (err) {
      console.error('Error loading daily summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load daily summary');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [targetDate]);

  // Initial load and when date changes
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Refresh when trigger changes (for cross-hook communication)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      console.log(`Daily summary refresh triggered: ${refreshTrigger}`);
      loadSummary(false); // Don't show loading for trigger-based refresh
    }
  }, [refreshTrigger, loadSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary: loadSummary
  };
}