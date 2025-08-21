export interface FruitPreset {
  name_thai: string;
  name_english: string;
  price_per_kg: number;
}

export const FRUIT_PRESETS: FruitPreset[] = [
  { name_thai: "มะม่วง", name_english: "Mango", price_per_kg: 60 },
  { name_thai: "เงาะ", name_english: "Rambutan", price_per_kg: 80 },
  { name_thai: "มังคุด", name_english: "Mangosteen", price_per_kg: 120 },
  { name_thai: "สับปะรด", name_english: "Pineapple", price_per_kg: 40 },
  { name_thai: "แก้วมังกร", name_english: "Dragon Fruit", price_per_kg: 70 },
  { name_thai: "ทุเรียน", name_english: "Durian", price_per_kg: 150 },
  { name_thai: "มะละกอ", name_english: "Papaya", price_per_kg: 35 },
  { name_thai: "กล้วย", name_english: "Banana", price_per_kg: 25 },
  { name_thai: "มะพร้าว", name_english: "Coconut", price_per_kg: 30 },
  { name_thai: "ลำไย", name_english: "Longan", price_per_kg: 90 },
  { name_thai: "ลิ้นจี่", name_english: "Lychee", price_per_kg: 100 },
  { name_thai: "ขนุน", name_english: "Jackfruit", price_per_kg: 50 },
  { name_thai: "ฝรั่ง", name_english: "Guava", price_per_kg: 45 },
  { name_thai: "ส้มโอ", name_english: "Pomelo", price_per_kg: 55 },
  { name_thai: "แตงโม", name_english: "Watermelon", price_per_kg: 20 },
  { name_thai: "ชมพู่", name_english: "Rose Apple", price_per_kg: 65 },
  { name_thai: "มะฟืง", name_english: "Star Fruit", price_per_kg: 55 },
  { name_thai: "ระกำ", name_english: "Snake Fruit", price_per_kg: 85 },
  { name_thai: "น้อยหน่า", name_english: "Custard Apple", price_per_kg: 95 },
  { name_thai: "มะยงชิด", name_english: "Ma Yong Chit", price_per_kg: 110 },
  { name_thai: "มะปรางหวาน", name_english: "Plum Mango", price_per_kg: 75 },
  { name_thai: "ส้มจีน", name_english: "Small Orange", price_per_kg: 60 },
  { name_thai: "ทับทิม", name_english: "Pomegranate", price_per_kg: 120 },
  { name_thai: "กระท้อน", name_english: "Kraton", price_per_kg: 80 },
  { name_thai: "มะมอก", name_english: "Makok", price_per_kg: 70 }
];

export function getPresetByName(name: string): FruitPreset | undefined {
  return FRUIT_PRESETS.find(
    fruit => fruit.name_thai === name || fruit.name_english.toLowerCase() === name.toLowerCase()
  );
}