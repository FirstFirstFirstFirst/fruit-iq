// Mock data for simplified demo
export interface Fruit {
  id: number
  nameEnglish?: string
  nameThai: string
  pricePerKg: number
  emoji: string
  category?: string
  description?: string
  nutritionFacts?: {
    calories: number;
    carbs: number;
    fiber: number;
    sugar: number;
    protein: number;
    fat: number;
    vitamin_c: number;
  }
}

export interface Transaction {
  id: number
  fruitId: number
  weightKg: number
  pricePerKg: number
  totalAmount: number
  timestamp: string
  photoPath?: string
  isSaved?: boolean
  fruit?: Fruit
}

export const MOCK_FRUITS: Fruit[] = [
  { id: 1, nameEnglish: "Apple", nameThai: "แอปเปิล", pricePerKg: 120, emoji: "🍎" },
  { id: 2, nameEnglish: "Orange", nameThai: "ส้ม", pricePerKg: 80, emoji: "🍊" },
  { id: 3, nameEnglish: "Banana", nameThai: "กล้วย", pricePerKg: 60, emoji: "🍌" },
  { id: 4, nameEnglish: "Mango", nameThai: "มะม่วง", pricePerKg: 150, emoji: "🥭" },
  { id: 5, nameEnglish: "Pineapple", nameThai: "สับปะรด", pricePerKg: 90, emoji: "🍍" },
  { id: 6, nameEnglish: "Watermelon", nameThai: "แตงโม", pricePerKg: 45, emoji: "🍉" },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    fruitId: 1,
    weightKg: 1.25,
    pricePerKg: 120,
    totalAmount: 150,
    timestamp: "2024-01-20T10:30:00Z"
  },
  {
    id: 2,
    fruitId: 3,
    weightKg: 2.4,
    pricePerKg: 60,
    totalAmount: 144,
    timestamp: "2024-01-20T14:15:00Z"
  }
]