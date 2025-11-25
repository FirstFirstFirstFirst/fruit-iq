import { useState, useEffect, useCallback } from 'react';
import {
  FruitAPI,
  TransactionAPI,
  SettingsAPI,
  Fruit,
  FruitTransaction,
  WeighPaySettings,
  CreateFruitRequest,
  UpdateFruitRequest,
  CreateTransactionRequest,
  UpdateSettingsRequest,
  DailySummary,
} from '../lib/api';

// Global refresh trigger for cross-component updates
let globalRefreshTrigger = 0;
export const triggerGlobalRefresh = () => {
  globalRefreshTrigger++;
};

// Hook for Fruit Management
export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadFruits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FruitAPI.getAllFruits();
      setFruits(data);
    } catch (err) {
      console.error('Error loading fruits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fruits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFruits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFruits, refreshTrigger, globalRefreshTrigger]);

  const addFruit = useCallback(async (fruit: CreateFruitRequest): Promise<Fruit> => {
    const response = await FruitAPI.createFruit(fruit);
    setRefreshTrigger((prev) => prev + 1);
    triggerGlobalRefresh();
    return response.fruit;
  }, []);

  const updateFruit = useCallback(async (
    fruitId: number,
    updates: UpdateFruitRequest
  ): Promise<Fruit> => {
    const updated = await FruitAPI.updateFruit(fruitId, updates);
    setRefreshTrigger((prev) => prev + 1);
    triggerGlobalRefresh();
    return updated;
  }, []);

  const deleteFruit = useCallback(async (fruitId: number): Promise<void> => {
    await FruitAPI.deleteFruit(fruitId);
    setRefreshTrigger((prev) => prev + 1);
    triggerGlobalRefresh();
  }, []);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    fruits,
    loading,
    error,
    addFruit,
    updateFruit,
    deleteFruit,
    refresh,
  };
}

// Hook for Transaction Management
export function useTransactions() {
  const [transactions, setTransactions] = useState<FruitTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTransactions = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    isSaved?: boolean;
    fruitId?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionAPI.getAllTransactions(params);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions({ isSaved: true }); // Load saved transactions by default
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTransactions, refreshTrigger, globalRefreshTrigger]);

  const addTransaction = useCallback(async (
    transaction: CreateTransactionRequest
  ): Promise<FruitTransaction> => {
    const response = await TransactionAPI.createTransaction(transaction);
    setRefreshTrigger((prev) => prev + 1);
    triggerGlobalRefresh();
    return response.transaction;
  }, []);

  const markTransactionAsSaved = useCallback(async (
    transactionId: number
  ): Promise<FruitTransaction> => {
    const response = await TransactionAPI.markAsSaved(transactionId);
    setRefreshTrigger((prev) => prev + 1);
    triggerGlobalRefresh();
    return response.transaction;
  }, []);

  const refresh = useCallback((params?: {
    startDate?: string;
    endDate?: string;
    isSaved?: boolean;
    fruitId?: number;
  }) => {
    loadTransactions(params);
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    markTransactionAsSaved,
    refresh,
  };
}

// Hook for Daily Sales Summary
export function useDailySales(date?: string) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionAPI.getDailySummary(date);
      setSummary(data);
    } catch (err) {
      console.error('Error loading daily summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load daily summary');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSummary, refreshTrigger, globalRefreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}

// Hook for WeighPay Settings
export function useSettings(enabled: boolean = true) {
  const [settings, setSettings] = useState<WeighPaySettings | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // [...DEBUG] Track settings load attempt
      console.log('[...DEBUG] useSettings: Attempting to load settings');
      const data = await SettingsAPI.getSettings();
      // [...DEBUG] Track successful load
      console.log('[...DEBUG] useSettings: Settings loaded successfully', { hasData: !!data });
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      // [...DEBUG] Enhanced error logging for settings
      console.error('[...DEBUG] useSettings Error Details:', {
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    loadSettings();
  }, [loadSettings, refreshTrigger, enabled]);

  const updateSettings = useCallback(async (
    updates: UpdateSettingsRequest
  ): Promise<WeighPaySettings> => {
    const response = await SettingsAPI.updateSettings(updates);
    setRefreshTrigger((prev) => prev + 1);
    return response.settings;
  }, []);

  const getPromptpayPhone = useCallback(async (): Promise<string | null> => {
    if (!settings) {
      const freshSettings = await SettingsAPI.getSettings();
      return freshSettings?.promptpayPhone || null;
    }
    return settings.promptpayPhone || null;
  }, [settings]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    settings,
    promptpayPhone: settings?.promptpayPhone,
    loading,
    error,
    updateSettings,
    getPromptpayPhone,
    refresh,
  };
}
