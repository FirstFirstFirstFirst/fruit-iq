import { useState, useEffect } from "react";
import { db, type Fruit } from "~/lib/database";
import { FRUIT_PRESETS } from "~/data/fruits";

export function useFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFruits = () => {
    try {
      const allFruits = db.getAllFruits();
      setFruits(allFruits);
    } catch (error) {
      console.error("Error loading fruits:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFruit = (
    name_thai: string,
    name_english: string,
    price_per_kg: number
  ) => {
    try {
      const id = db.addFruit({
        name_thai,
        name_english,
        price_per_kg,
        is_active: true,
      });
      loadFruits();
      return id;
    } catch (error) {
      console.error("Error adding fruit:", error);
      throw error;
    }
  };

  const updateFruit = (
    id: number,
    updates: Partial<Omit<Fruit, "id" | "created_at">>
  ) => {
    try {
      const success = db.updateFruit(id, updates);
      if (success) {
        loadFruits();
      }
      return success;
    } catch (error) {
      console.error("Error updating fruit:", error);
      throw error;
    }
  };

  const deleteFruit = (id: number) => {
    try {
      const success = db.deleteFruit(id);
      if (success) {
        loadFruits();
      }
      return success;
    } catch (error) {
      console.error("Error deleting fruit:", error);
      throw error;
    }
  };

  const loadPresets = () => {
    try {
      db.loadPresetFruits();
      loadFruits();
    } catch (error) {
      console.error("Error loading presets:", error);
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
