import * as SQLite from 'expo-sqlite';
import { Store, createStore } from 'tinybase';

// Database interface
export interface Fruit {
  id: number;
  nameThai: string;
  nameEnglish?: string;
  pricePerKg: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  fruitId: number;
  weightKg: number;
  pricePerKg: number;
  totalAmount: number;
  photoPath?: string;
  qrCodeData: string;
  createdAt: string;
  syncedAt?: string;
}

export interface DailySummary {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  topFruitId?: number;
  createdAt: string;
}

class DatabaseManager {
  private db: SQLite.SQLiteDatabase;
  private store: Store;
  private initialized = false;

  constructor() {
    this.db = SQLite.openDatabaseSync('fruitiq.db');
    this.store = createStore();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create tables
      await this.createTables();
      
      // Load data into TinyBase store
      await this.loadDataIntoStore();
      
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    // Fruits table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS fruits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_thai TEXT NOT NULL,
        name_english TEXT,
        price_per_kg REAL NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fruit_id INTEGER NOT NULL,
        weight_kg REAL NOT NULL,
        price_per_kg REAL NOT NULL,
        total_amount REAL NOT NULL,
        photo_path TEXT,
        qr_code_data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced_at TEXT,
        FOREIGN KEY (fruit_id) REFERENCES fruits (id)
      );
    `);

    // Daily summaries table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY,
        total_transactions INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        top_fruit_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (top_fruit_id) REFERENCES fruits (id)
      );
    `);

    // Create indexes for better performance
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date 
      ON transactions(DATE(created_at));
    `);
    
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_fruit_id 
      ON transactions(fruit_id);
    `);
  }

  private async loadDataIntoStore() {
    // Load fruits into TinyBase store
    const fruits = this.db.getAllSync('SELECT * FROM fruits WHERE is_active = 1');
    fruits.forEach((fruit: any) => {
      this.store.setRow('fruits', fruit.id.toString(), {
        nameThai: fruit.name_thai,
        nameEnglish: fruit.name_english || '',
        pricePerKg: fruit.price_per_kg,
        isActive: fruit.is_active === 1,
        createdAt: fruit.created_at
      });
    });

    // Load today's transactions
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = this.db.getAllSync(
      'SELECT * FROM transactions WHERE DATE(created_at) = ? ORDER BY created_at DESC', 
      [today]
    );
    
    todayTransactions.forEach((transaction: any) => {
      this.store.setRow('transactions', transaction.id.toString(), {
        fruitId: transaction.fruit_id,
        weightKg: transaction.weight_kg,
        pricePerKg: transaction.price_per_kg,
        totalAmount: transaction.total_amount,
        photoPath: transaction.photo_path || '',
        qrCodeData: transaction.qr_code_data,
        createdAt: transaction.created_at,
        syncedAt: transaction.synced_at || ''
      });
    });

    // Load daily summary for today
    const summary = this.db.getFirstSync(
      'SELECT * FROM daily_summaries WHERE date = ?', 
      [today]
    );
    
    if (summary) {
      this.store.setRow('dailySummaries', today, {
        totalTransactions: summary.total_transactions,
        totalRevenue: summary.total_revenue,
        topFruitId: summary.top_fruit_id || 0,
        createdAt: summary.created_at
      });
    }
  }

  // Fruit operations
  async addFruit(fruit: Omit<Fruit, 'id' | 'createdAt'>): Promise<number> {
    const result = this.db.runSync(
      'INSERT INTO fruits (name_thai, name_english, price_per_kg, is_active) VALUES (?, ?, ?, ?)',
      [fruit.nameThai, fruit.nameEnglish || null, fruit.pricePerKg, fruit.isActive ? 1 : 0]
    );

    const fruitId = result.lastInsertRowId;
    
    // Update TinyBase store
    this.store.setRow('fruits', fruitId.toString(), {
      nameThai: fruit.nameThai,
      nameEnglish: fruit.nameEnglish || '',
      pricePerKg: fruit.pricePerKg,
      isActive: fruit.isActive,
      createdAt: new Date().toISOString()
    });

    return fruitId;
  }

  async updateFruit(id: number, updates: Partial<Fruit>): Promise<void> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([key, value]) => {
        if (key === 'isActive') return value ? 1 : 0;
        return value;
      });

    this.db.runSync(
      `UPDATE fruits SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    // Update TinyBase store
    const existingFruit = this.store.getRow('fruits', id.toString());
    this.store.setRow('fruits', id.toString(), { ...existingFruit, ...updates });
  }

  // Transaction operations
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> {
    const now = new Date().toISOString();
    
    const result = this.db.runSync(
      'INSERT INTO transactions (fruit_id, weight_kg, price_per_kg, total_amount, photo_path, qr_code_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        transaction.fruitId,
        transaction.weightKg,
        transaction.pricePerKg,
        transaction.totalAmount,
        transaction.photoPath || null,
        transaction.qrCodeData,
        now
      ]
    );

    const transactionId = result.lastInsertRowId;

    // Update TinyBase store
    this.store.setRow('transactions', transactionId.toString(), {
      ...transaction,
      createdAt: now,
      syncedAt: ''
    });

    // Update daily summary
    await this.updateDailySummary();

    return transactionId;
  }

  private async updateDailySummary(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's totals
    const totals = this.db.getFirstSync(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as total_revenue,
        fruit_id as top_fruit_id
      FROM transactions 
      WHERE DATE(created_at) = ?
      GROUP BY fruit_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, [today]);

    if (totals) {
      // Upsert daily summary
      this.db.runSync(`
        INSERT INTO daily_summaries (date, total_transactions, total_revenue, top_fruit_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          total_transactions = excluded.total_transactions,
          total_revenue = excluded.total_revenue,
          top_fruit_id = excluded.top_fruit_id
      `, [today, totals.total_transactions, totals.total_revenue || 0, totals.top_fruit_id]);

      // Update TinyBase store
      this.store.setRow('dailySummaries', today, {
        totalTransactions: totals.total_transactions,
        totalRevenue: totals.total_revenue || 0,
        topFruitId: totals.top_fruit_id || 0,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Getters for TinyBase store (reactive)
  getStore(): Store {
    return this.store;
  }

  // Data export for sync
  async getUnsyncedTransactions(): Promise<Transaction[]> {
    const transactions = this.db.getAllSync(
      'SELECT * FROM transactions WHERE synced_at IS NULL'
    );
    
    return transactions.map(t => ({
      id: t.id,
      fruitId: t.fruit_id,
      weightKg: t.weight_kg,
      pricePerKg: t.price_per_kg,
      totalAmount: t.total_amount,
      photoPath: t.photo_path,
      qrCodeData: t.qr_code_data,
      createdAt: t.created_at,
      syncedAt: t.synced_at
    }));
  }

  async markTransactionsSynced(transactionIds: number[]): Promise<void> {
    const now = new Date().toISOString();
    const placeholders = transactionIds.map(() => '?').join(',');
    
    this.db.runSync(
      `UPDATE transactions SET synced_at = ? WHERE id IN (${placeholders})`,
      [now, ...transactionIds]
    );

    // Update TinyBase store
    transactionIds.forEach(id => {
      const existing = this.store.getRow('transactions', id.toString());
      if (existing) {
        this.store.setRow('transactions', id.toString(), {
          ...existing,
          syncedAt: now
        });
      }
    });
  }
}

// Singleton instance
export const db = new DatabaseManager();

// Initialize database on module load
db.initialize().catch(console.error);