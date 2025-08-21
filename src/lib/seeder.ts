import { db } from './database'
import { PHUKET_FRUITS } from './constants'

export class DataSeeder {
  static async seedFruits() {
    try {
      console.log('Seeding Phuket fruits...')
      
      for (const fruit of PHUKET_FRUITS) {
        await db.addFruit({
          nameThai: fruit.nameThai,
          nameEnglish: fruit.nameEnglish,
          pricePerKg: fruit.defaultPrice,
          isActive: true
        })
      }
      
      console.log(`Successfully seeded ${PHUKET_FRUITS.length} fruits`)
    } catch (error) {
      console.error('Error seeding fruits:', error)
      throw error
    }
  }

  static async checkAndSeedIfEmpty() {
    try {
      // Check if we have any fruits
      const store = db.getStore()
      const fruitIds = store.getRowIds('fruits')
      
      if (fruitIds.length === 0) {
        console.log('No fruits found, seeding with Phuket presets...')
        await this.seedFruits()
      } else {
        console.log(`Found ${fruitIds.length} existing fruits, skipping seed`)
      }
    } catch (error) {
      console.error('Error checking/seeding data:', error)
      // Don't throw here to prevent app crashes
    }
  }
}

// Auto-seed when the module loads
setTimeout(() => {
  DataSeeder.checkAndSeedIfEmpty()
}, 1000) // Wait 1 second for database to fully initialize