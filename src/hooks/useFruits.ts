import { useState, useEffect } from 'react';
import { db, type Fruit } from '~/lib/database';
import { FRUIT_PRESETS } from '~/data/fruits';

export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFruits = async () => {
    try {
      const allFruits = db.getAllFruits();
      setFruits(allFruits);
    } catch (error) {
      console.error('Error loading fruits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFruit = async (name_thai: string, name_english: string, price_per_kg: number) => {
    try {
      const id = db.addFruit({
        name_thai,
        name_english,
        price_per_kg,
        is_active: true,
      });
      await loadFruits();
      return id;
    } catch (error) {
      console.error('Error adding fruit:', error);
      throw error;
    }
  };

  const updateFruit = async (id: number, updates: Partial<Omit<Fruit, 'id' | 'created_at'>>) => {
    try {
      const success = db.updateFruit(id, updates);
      if (success) {
        await loadFruits();
      }
      return success;
    } catch (error) {
      console.error('Error updating fruit:', error);
      throw error;
    }
  };

  const deleteFruit = async (id: number) => {
    try {
      const success = db.deleteFruit(id);
      if (success) {
        await loadFruits();
      }
      return success;
    } catch (error) {
      console.error('Error deleting fruit:', error);
      throw error;
    }
  };

  const loadPresets = async () => {
    try {
      // Check if any fruits exist
      const existingFruits = db.getAllFruits();
      
      if (existingFruits.length === 0) {
        // Load preset fruits
        for (const preset of FRUIT_PRESETS) {
          db.addFruit({
            name_thai: preset.name_thai,
            name_english: preset.name_english,
            price_per_kg: preset.price_per_kg,
            is_active: true,
          });
        }
        await loadFruits();
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  useEffect(() => {
    loadFruits();
  }, []);

  return {
    fruits,
    loading,
    addFruit,
    updateFruit,
    deleteFruit,
    loadPresets,
    refresh: loadFruits,
  };
}