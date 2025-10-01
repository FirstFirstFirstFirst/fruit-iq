/**
 * SQLite Database Setup and Management
 * Handles offline-first data storage for WeighPay app
 */

import * as SQLite from 'expo-sqlite';
import { Fruit, Transaction } from '../data/mockData';

const DB_NAME = 'weighpay.db';
// const DB_VERSION = 1; // Reserved for future migration use

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Guard: Check if SQLite module is available
    if (!SQLite?.openDatabaseAsync) {
      throw new Error('SQLite module not available. Please check expo-sqlite installation.');
    }

    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Guard: Verify database instance was created
    if (!db) {
      throw new Error('Failed to open database. Database instance is null.');
    }

    // Guard: Check if execAsync method exists before calling
    if (!db.execAsync) {
      throw new Error('Database execAsync method not available.');
    }

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await createTables();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Ensure db is null on failure
    db = null;
    throw error;
  }
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  // Guard: Verify execAsync method exists
  if (!db.execAsync) {
    throw new Error('Database execAsync method not available');
  }

  try {
    // Create fruits table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fruits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_thai TEXT NOT NULL,
        name_english TEXT,
        emoji TEXT NOT NULL DEFAULT '🍎',
        price_per_kg REAL NOT NULL,
        category TEXT NOT NULL DEFAULT 'fruit',
        description TEXT,
        nutrition_facts TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fruit_id INTEGER NOT NULL,
        weight_kg REAL NOT NULL,
        price_per_kg REAL NOT NULL,
        total_amount REAL NOT NULL,
        qr_code_data TEXT,
        promptpay_phone TEXT,
        photo_path TEXT,
        is_saved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fruit_id) REFERENCES fruits(id)
      );
    `);

    // Create daily summaries table for sales reports
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY,
        total_transactions INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        top_fruit_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (top_fruit_id) REFERENCES fruits(id)
      );
    `);

    // Create settings table for app configuration
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Error creating tables:', error);
    throw new Error(`Failed to create database tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get database instance
 */
function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Fruits CRUD Operations
export const fruitsDB = {
  /**
   * Get all active fruits
   */
  async getAllFruits(): Promise<Fruit[]> {
    const database = getDatabase();
    const result = await database.getAllAsync(`
      SELECT * FROM fruits 
      WHERE is_active = 1 
      ORDER BY name_thai
    `) as Record<string, unknown>[];
    
    return result.map((row) => ({
      id: row.id as number,
      nameThai: row.name_thai as string,
      nameEnglish: row.name_english as string,
      emoji: row.emoji as string,
      pricePerKg: row.price_per_kg as number,
      category: row.category as string,
      description: row.description as string,
      nutritionFacts: row.nutrition_facts ? JSON.parse(row.nutrition_facts as string) : undefined
    }));
  },

  /**
   * Add a new fruit
   */
  async addFruit(fruit: Omit<Fruit, 'id'>): Promise<Fruit> {
    const database = getDatabase();
    const result = await database.runAsync(`
      INSERT INTO fruits (name_thai, name_english, emoji, price_per_kg, category, description, nutrition_facts)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      fruit.nameThai,
      fruit.nameEnglish || '',
      fruit.emoji,
      fruit.pricePerKg,
      fruit.category || 'fruit',
      fruit.description || '',
      fruit.nutritionFacts ? JSON.stringify(fruit.nutritionFacts) : null
    ]);

    return {
      id: result.lastInsertRowId,
      ...fruit
    };
  },

  /**
   * Update a fruit
   */
  async updateFruit(id: number, updates: Partial<Omit<Fruit, 'id'>>): Promise<void> {
    const database = getDatabase();
    const fields = [];
    const values = [];

    if (updates.nameThai) {
      fields.push('name_thai = ?');
      values.push(updates.nameThai);
    }
    if (updates.nameEnglish) {
      fields.push('name_english = ?');
      values.push(updates.nameEnglish);
    }
    if (updates.emoji) {
      fields.push('emoji = ?');
      values.push(updates.emoji);
    }
    if (updates.pricePerKg !== undefined) {
      fields.push('price_per_kg = ?');
      values.push(updates.pricePerKg);
    }
    if (updates.category) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.description) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.nutritionFacts) {
      fields.push('nutrition_facts = ?');
      values.push(JSON.stringify(updates.nutritionFacts));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await database.runAsync(`
      UPDATE fruits 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `, values);
  },

  /**
   * Delete a fruit (soft delete)
   */
  async deleteFruit(id: number): Promise<void> {
    const database = getDatabase();
    await database.runAsync(`
      UPDATE fruits 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
  }
};

// Transactions CRUD Operations
export const transactionsDB = {
  /**
   * Get all transactions with fruit details
   */
  async getAllTransactions(): Promise<(Transaction & { fruit?: Fruit })[]> {
    const database = getDatabase();
    const result = await database.getAllAsync(`
      SELECT 
        t.*,
        f.name_thai as fruit_name_thai,
        f.name_english as fruit_name_english,
        f.emoji as fruit_emoji,
        f.category as fruit_category,
        f.description as fruit_description,
        f.nutrition_facts as fruit_nutrition_facts
      FROM transactions t
      LEFT JOIN fruits f ON t.fruit_id = f.id
      ORDER BY t.created_at DESC
    `) as Record<string, unknown>[];

    return result.map((row) => ({
      id: row.id as number,
      fruitId: row.fruit_id as number,
      weightKg: row.weight_kg as number,
      pricePerKg: row.price_per_kg as number,
      totalAmount: row.total_amount as number,
      qrCodeData: row.qr_code_data as string,
      promptpayPhone: row.promptpay_phone as string,
      photoPath: row.photo_path as string,
      isSaved: Boolean(row.is_saved),
      timestamp: row.created_at as string,
      fruit: row.fruit_name_thai ? {
        id: row.fruit_id as number,
        nameThai: row.fruit_name_thai as string,
        nameEnglish: row.fruit_name_english as string,
        emoji: row.fruit_emoji as string,
        pricePerKg: row.price_per_kg as number,
        category: row.fruit_category as string,
        description: row.fruit_description as string,
        nutritionFacts: row.fruit_nutrition_facts ? JSON.parse(row.fruit_nutrition_facts as string) : undefined
      } : undefined
    }));
  },

  /**
   * Add a new transaction
   */
  async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'> & {
    qrCodeData?: string;
    promptpayPhone?: string;
    isSaved?: boolean;
  }): Promise<Transaction> {
    const database = getDatabase();
    const result = await database.runAsync(`
      INSERT INTO transactions (
        fruit_id, weight_kg, price_per_kg, total_amount, 
        qr_code_data, promptpay_phone, photo_path, is_saved
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transaction.fruitId,
      transaction.weightKg,
      transaction.pricePerKg,
      transaction.totalAmount,
      transaction.qrCodeData || '',
      transaction.promptpayPhone || '',
      transaction.photoPath || '',
      transaction.isSaved ? 1 : 0
    ]);

    // Get the created transaction
    const created = await database.getFirstAsync(`
      SELECT * FROM transactions WHERE id = ?
    `, [result.lastInsertRowId]) as Record<string, unknown>;

    const createdRow = created;
    return {
      id: createdRow.id as number,
      fruitId: createdRow.fruit_id as number,
      weightKg: createdRow.weight_kg as number,
      pricePerKg: createdRow.price_per_kg as number,
      totalAmount: createdRow.total_amount as number,
      photoPath: createdRow.photo_path as string,
      timestamp: createdRow.created_at as string
    };
  },

  /**
   * Mark transaction as saved (after QR payment confirmation)
   */
  async markTransactionAsSaved(id: number): Promise<void> {
    const database = getDatabase();
    
    console.log(`Database: Marking transaction ${id} as saved`);
    
    const result = await database.runAsync(`
      UPDATE transactions 
      SET is_saved = 1
      WHERE id = ?
    `, [id]);
    
    console.log(`Database: Update result for transaction ${id}:`, {
      changes: result.changes,
      lastInsertRowId: result.lastInsertRowId
    });
    
    if (result.changes === 0) {
      throw new Error(`Transaction ${id} not found or already saved`);
    }
    
    // Verify the update
    const verifyResult = await database.getFirstAsync(`
      SELECT is_saved FROM transactions WHERE id = ?
    `, [id]) as { is_saved: number } | null;
    
    console.log(`Database: Verification for transaction ${id}: is_saved = ${verifyResult?.is_saved}`);
  },

  /**
   * Get daily sales summary
   */
  async getDailySummary(date: string): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    topFruit?: Fruit;
  }> {
    const database = getDatabase();
    
    // Get summary data for the specific date
    const summary = await database.getFirstAsync(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as total_revenue
      FROM transactions
      WHERE DATE(created_at) = ? AND is_saved = 1
    `, [date]) as Record<string, unknown> | null;

    // Get top selling fruit for the date
    const topFruitData = await database.getFirstAsync(`
      SELECT 
        f.*,
        COUNT(t.id) as sale_count,
        SUM(t.total_amount) as revenue
      FROM transactions t
      JOIN fruits f ON t.fruit_id = f.id
      WHERE DATE(t.created_at) = ? AND t.is_saved = 1
      GROUP BY f.id
      ORDER BY sale_count DESC, revenue DESC
      LIMIT 1
    `, [date]) as Record<string, unknown> | null;

    const topFruit = topFruitData ? {
      id: topFruitData.id as number,
      nameThai: topFruitData.name_thai as string,
      nameEnglish: topFruitData.name_english as string,
      emoji: topFruitData.emoji as string,
      pricePerKg: topFruitData.price_per_kg as number,
      category: topFruitData.category as string,
      description: topFruitData.description as string,
      nutritionFacts: topFruitData.nutrition_facts ? JSON.parse(topFruitData.nutrition_facts as string) : undefined
    } : undefined;

    return {
      totalTransactions: (summary?.total_transactions as number) || 0,
      totalRevenue: (summary?.total_revenue as number) || 0,
      topFruit
    };
  }
};

// Settings Operations
export const settingsDB = {
  /**
   * Get a setting value
   */
  async getSetting(key: string): Promise<string | null> {
    const database = getDatabase();
    const result = await database.getFirstAsync(`
      SELECT value FROM settings WHERE key = ?
    `, [key]) as Record<string, unknown> | null;
    
    return result ? (result.value as string) : null;
  },

  /**
   * Set a setting value
   */
  async setSetting(key: string, value: string): Promise<void> {
    const database = getDatabase();
    await database.runAsync(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, value]);
  }
};

/**
 * Seed initial data (fruits)
 */
export async function seedInitialData(): Promise<void> {
  const fruits = await fruitsDB.getAllFruits();
  
  // Only seed if no fruits exist
  if (fruits.length === 0) {
    const initialFruits: Omit<Fruit, 'id'>[] = [
      {
        nameThai: 'มะม่วง',
        nameEnglish: 'Mango',
        emoji: '🥭',
        pricePerKg: 120,
        category: 'tropical',
        description: 'ผลไม้เมืองร้อนรสหวาน',
        nutritionFacts: { calories: 60, carbs: 15, fiber: 2, sugar: 13, protein: 1, fat: 0.4, vitamin_c: 36 }
      },
      {
        nameThai: 'สับปะรด',
        nameEnglish: 'Pineapple',
        emoji: '🍍',
        pricePerKg: 80,
        category: 'tropical',
        description: 'ผลไม้รสเปรี้ยวหวาน',
        nutritionFacts: { calories: 50, carbs: 13, fiber: 1.4, sugar: 10, protein: 0.5, fat: 0.1, vitamin_c: 47 }
      },
      {
        nameThai: 'กล้วยหอม',
        nameEnglish: 'Banana',
        emoji: '🍌',
        pricePerKg: 40,
        category: 'tropical',
        description: 'กล้วยหอมหวาน',
        nutritionFacts: { calories: 89, carbs: 23, fiber: 2.6, sugar: 12, protein: 1.1, fat: 0.3, vitamin_c: 8 }
      },
      {
        nameThai: 'ส้มโอ',
        nameEnglish: 'Pomelo',
        emoji: '🍊',
        pricePerKg: 60,
        category: 'citrus',
        description: 'ผลไม้ตระกูลส้ม',
        nutritionFacts: { calories: 38, carbs: 10, fiber: 1, sugar: 7, protein: 0.8, fat: 0.04, vitamin_c: 61 }
      },
      {
        nameThai: 'มะละกอ',
        nameEnglish: 'Papaya',
        emoji: '🫐',
        pricePerKg: 35,
        category: 'tropical',
        description: 'ผลไม้สีส้มหวานอ่อน',
        nutritionFacts: { calories: 43, carbs: 11, fiber: 1.7, sugar: 8, protein: 0.5, fat: 0.3, vitamin_c: 61 }
      }
    ];

    for (const fruit of initialFruits) {
      await fruitsDB.addFruit(fruit);
    }
    
    console.log('Initial fruit data seeded successfully');
  }
}