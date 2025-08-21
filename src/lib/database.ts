import * as SQLite from 'expo-sqlite';
import { createStore, Store, createPersister } from 'tinybase';

export interface Fruit {
  id: number;
  name_thai: string;
  name_english?: string;
  price_per_kg: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  fruit_id: number;
  weight_kg: number;
  price_per_kg: number;
  total_amount: number;
  photo_path?: string;
  qr_code_data?: string;
  created_at: string;
  synced_at?: string;
}

export interface DailySummary {
  date: string;
  total_transactions: number;
  total_revenue: number;
  top_fruit_id?: number;
  created_at: string;
}

class DatabaseManager {
  private db: SQLite.SQLiteDatabase;
  public store: Store;
  
  constructor() {
    this.db = SQLite.openDatabaseSync('fruitiq.db');
    this.store = createStore();
    this.initializeDatabase();
    this.setupTinyBase();
  }

  private initializeDatabase() {
    // Create fruits table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS fruits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_thai TEXT NOT NULL,
        name_english TEXT,
        price_per_kg REAL NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fruit_id INTEGER NOT NULL,
        weight_kg REAL NOT NULL,
        price_per_kg REAL NOT NULL,
        total_amount REAL NOT NULL,
        photo_path TEXT,
        qr_code_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME,
        FOREIGN KEY (fruit_id) REFERENCES fruits (id)
      );
    `);

    // Create daily summaries table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY,
        total_transactions INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        top_fruit_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (top_fruit_id) REFERENCES fruits (id)
      );
    `);

    // Create indexes for better performance
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date 
      ON transactions (date(created_at));
    `);
    
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_fruits_active 
      ON fruits (is_active);
    `);
  }

  private setupTinyBase() {
    // Create persister to sync TinyBase store with SQLite
    const persister = createPersister(
      this.store,
      async () => {
        // Load data from SQLite to TinyBase
        await this.loadDataToStore();
      },
      async () => {
        // Save data from TinyBase to SQLite (handled individually)
      }
    );

    persister.startAutoSave();
  }

  private async loadDataToStore() {
    try {
      // Load fruits
      const fruits = this.getAllFruits();
      const fruitsData: { [key: string]: any } = {};
      fruits.forEach(fruit => {
        fruitsData[fruit.id.toString()] = {
          name_thai: fruit.name_thai,
          name_english: fruit.name_english || '',
          price_per_kg: fruit.price_per_kg,
          is_active: fruit.is_active,
          created_at: fruit.created_at,
        };
      });
      this.store.setTable('fruits', fruitsData);

      // Load today's transactions
      const today = new Date().toISOString().split('T')[0];
      const transactions = this.getTransactionsByDate(today);
      const transactionsData: { [key: string]: any } = {};
      transactions.forEach(transaction => {
        transactionsData[transaction.id.toString()] = {
          fruit_id: transaction.fruit_id,
          weight_kg: transaction.weight_kg,
          price_per_kg: transaction.price_per_kg,
          total_amount: transaction.total_amount,
          photo_path: transaction.photo_path || '',
          qr_code_data: transaction.qr_code_data || '',
          created_at: transaction.created_at,
          synced_at: transaction.synced_at || '',
        };
      });
      this.store.setTable('transactions', transactionsData);

    } catch (error) {
      console.error('Error loading data to store:', error);
    }
  }

  // Fruit operations
  getAllFruits(): Fruit[] {
    const statement = this.db.prepareSync('SELECT * FROM fruits WHERE is_active = 1 ORDER BY name_thai');
    return statement.executeSync().getAllSync() as Fruit[];
  }

  addFruit(fruit: Omit<Fruit, 'id' | 'created_at'>): number {
    const statement = this.db.prepareSync(
      'INSERT INTO fruits (name_thai, name_english, price_per_kg, is_active) VALUES (?, ?, ?, ?)'
    );
    const result = statement.executeSync(
      fruit.name_thai,
      fruit.name_english || null,
      fruit.price_per_kg,
      fruit.is_active
    );
    
    // Update TinyBase store
    this.loadDataToStore();
    
    return result.lastInsertRowId;
  }

  updateFruit(id: number, fruit: Partial<Omit<Fruit, 'id' | 'created_at'>>): boolean {
    const fields = Object.keys(fruit).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fruit);
    
    const statement = this.db.prepareSync(`UPDATE fruits SET ${fields} WHERE id = ?`);
    const result = statement.executeSync(...values, id);
    
    // Update TinyBase store
    this.loadDataToStore();
    
    return result.changes > 0;
  }

  deleteFruit(id: number): boolean {
    const statement = this.db.prepareSync('UPDATE fruits SET is_active = 0 WHERE id = ?');
    const result = statement.executeSync(id);
    
    // Update TinyBase store
    this.loadDataToStore();
    
    return result.changes > 0;
  }

  // Transaction operations
  addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): number {
    const statement = this.db.prepareSync(`
      INSERT INTO transactions 
      (fruit_id, weight_kg, price_per_kg, total_amount, photo_path, qr_code_data) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = statement.executeSync(
      transaction.fruit_id,
      transaction.weight_kg,
      transaction.price_per_kg,
      transaction.total_amount,
      transaction.photo_path || null,
      transaction.qr_code_data || null
    );

    // Update daily summary
    this.updateDailySummary();
    
    // Update TinyBase store
    this.loadDataToStore();
    
    return result.lastInsertRowId;
  }

  getTransactionsByDate(date: string): Transaction[] {
    const statement = this.db.prepareSync(`
      SELECT * FROM transactions 
      WHERE date(created_at) = date(?) 
      ORDER BY created_at DESC
    `);
    return statement.executeSync(date).getAllSync() as Transaction[];
  }

  getTodaysTransactions(): Transaction[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getTransactionsByDate(today);
  }

  // Daily summary operations
  private updateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = this.getTransactionsByDate(today);
    
    const totalTransactions = todaysTransactions.length;
    const totalRevenue = todaysTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    
    // Find most popular fruit
    const fruitCounts: { [key: number]: number } = {};
    todaysTransactions.forEach(t => {
      fruitCounts[t.fruit_id] = (fruitCounts[t.fruit_id] || 0) + 1;
    });
    
    const topFruitId = Object.keys(fruitCounts).reduce((a, b) => 
      fruitCounts[parseInt(a)] > fruitCounts[parseInt(b)] ? a : b
    );

    const statement = this.db.prepareSync(`
      INSERT OR REPLACE INTO daily_summaries 
      (date, total_transactions, total_revenue, top_fruit_id, created_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    statement.executeSync(
      today,
      totalTransactions,
      totalRevenue,
      topFruitId ? parseInt(topFruitId) : null
    );
  }

  getDailySummary(date: string): DailySummary | null {
    const statement = this.db.prepareSync('SELECT * FROM daily_summaries WHERE date = ?');
    const result = statement.executeSync(date).getFirstSync() as DailySummary | null;
    return result;
  }

  getTodaysSummary(): DailySummary | null {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailySummary(today);
  }
}

// Singleton instance
export const db = new DatabaseManager();