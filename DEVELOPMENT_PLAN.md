# WeighPay App Development Plan

## MVP-First Approach (3-4 weeks)

### Overview

Building an offline-first fruit weighing app for Thai markets with camera OCR, PromptPay QR generation, and inventory tracking.

**Target Markets**: Phuket, Phangnga, Surat Thani fruit vendors
**Target Users**: Low-tech smartphone users with basic Android devices
**Core Flow**: Photo of scale → Extract weight → Calculate price → Generate PromptPay QR

### Team Structure

- **Developer A**: Frontend + UX Lead (React Native UI, Thai localization, camera integration)
- **Developer B**: Backend + Data Lead (Offline architecture, OCR, data management)

## ::do-with-team:: Progress Update (End of Week 1)

### ✅ Completed Foundation Tasks

**Developer A (Frontend)**

- [ ] Set up React Native + Expo project structure
- [ ] Configure NativeWind v4 + shadcn/ui components
- [ ] Create Thai-localized UI component library (Button, Input, Card)
- [ ] Build main navigation structure (planned)
- [ ] Design SetupScreen with fruit management UI
- [ ] Implement large button components for low-tech users

**Developer B (Data Architecture)**

- [ ] Set up SQLite with Expo SQLite
- [ ] Design database schema (fruits, transactions, inventory)
- [ ] Implement offline-first data layer with TinyBase
- [ ] Create data sync queue system for online connectivity
- [ ] Build basic CRUD operations for fruit management
- [ ] Build 25+ fruit preset system

### 🔄 In Progress (Week 1-2 Transition)

- [ ] Camera integration (react-native-vision-camera)
- [ ] OCR mock system with weight extraction
- [ ] CameraScreen with complete photo → OCR → transaction flow
- [ ] PromptPay QR code generation system
- [ ] HistoryScreen with daily accounting
- [ ] Navigation setup and App.tsx integration

### 📈 Ahead of Schedule

The team has completed most Week 1 AND Week 2 foundation tasks in just Week 1, including:

- Complete camera integration (planned for Week 3)
- OCR processing logic (planned for Week 3)
- Advanced UI screens (SetupScreen, CameraScreen)

### 🎯 Next Priority Tasks

1. PromptPay QR code generation
2. HistoryScreen with transaction history
3. Navigation structure and App.tsx
4. Tutorial/onboarding screens
5. Real device testing

---

### Weekly Breakdown

#### Week 1: Foundation

**Developer A - Frontend Foundation**

- [ ] Set up React Native + Expo project structure
- [ ] Configure NativeWind v4 + shadcn/ui components
- [ ] Create Thai-localized UI component library
- [ ] Build main navigation structure
- [ ] Design screens: Setup, Camera, History, Settings
- [ ] Implement large button components for low-tech users

**Developer B - Data Architecture**

- [ ] Set up SQLite with Expo SQLite
- [ ] Design database schema (fruits, transactions, inventory)
- [ ] Implement offline-first data layer with TinyBase
- [ ] Create data sync queue system for online connectivity
- [ ] Build basic CRUD operations for fruit management

**Daily Coordination**: Component prop definitions and API contracts

#### Week 2: Core Features

**Developer A - Inventory UI**

- [ ] Create fruit preset configuration with 25+ fruits
- [ ] Build fruit management screens (add, edit, delete)
- [ ] Design price configuration UI (Thai Baht)
- [ ] Implement transaction flow screens
- [ ] Add manual weight input components
- [ ] Create Thai language tutorial screens

**Developer B - Business Logic**

- [ ] Build inventory tracking logic
- [ ] Implement daily/weekly accounting calculations
- [ ] Create transaction storage system
- [ ] Add data validation and error handling
- [ ] Build fruit preset seeding system
- [ ] Implement currency formatting (Thai Baht)

**Daily Coordination**: Data flow integration and fruit preset structure

#### Week 3: Camera & OCR

**Developer A - Camera Integration**

- [ ] Integrate react-native-vision-camera
- [ ] Build camera screen with capture functionality
- [ ] Create manual weight input fallback
- [ ] Design QR code display screen
- [ ] Add camera optimization for poor quality devices
- [ ] Implement photo preview and retake functionality

**Developer B - OCR & QR Generation**

- [ ] Integrate ML Kit text recognition
- [ ] Build number extraction from scale displays (2.45 kg format)
- [ ] Implement PromptPay QR code generation
- [ ] Add OCR preprocessing for poor camera quality
- [ ] Create weight validation logic (2-3 decimal places)
- [ ] Build QR code generation with Thai Baht amounts

**Daily Coordination**: Camera → OCR → QR pipeline integration

#### Week 4: Integration & Polish

**Both Developers - Final Integration**

- [ ] Integration testing of complete workflow
- [ ] Thai market testing with real digital scales
- [ ] Bug fixes and performance optimization
- [ ] Add error handling for edge cases
- [ ] Implement data backup and restore
- [ ] App store preparation and builds
- [ ] Create user documentation in Thai

### Technical Architecture

#### Tech Stack

- **Frontend**: React Native + Expo SDK 52+
- **Styling**: NativeWind v4 + shadcn/ui components
- **Database**: SQLite + TinyBase for reactive offline-first
- **Camera**: react-native-vision-camera
- **OCR**: ML Kit text recognition (Android-optimized)
- **QR Generation**: react-native-qrcode-svg
- **Localization**: Thai language throughout

#### Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn-style components
│   ├── primitives/      # @rn-primitives base components
│   ├── composite/       # Complex fruit-specific components
│   └── __tests__/       # Component tests
├── lib/
│   ├── utils.ts         # cn() function and utilities
│   ├── constants.ts     # Thai fruits, colors, spacing
│   ├── database.ts      # SQLite setup and queries
│   └── ocr.ts          # OCR processing logic
├── hooks/
│   ├── useFruits.ts     # Fruit management
│   ├── useTransactions.ts # Transaction history
│   └── useCamera.ts     # Camera and OCR integration
├── screens/
│   ├── SetupScreen.tsx  # Initial fruit configuration
│   ├── CameraScreen.tsx # Photo capture and OCR
│   ├── HistoryScreen.tsx # Daily sales tracking
│   └── SettingsScreen.tsx # App configuration
└── data/
    ├── fruits.ts        # fruit presets
    └── schema.sql       # Database schema
```

#### Database Schema

```sql
-- Fruits configuration
CREATE TABLE fruits (
  id INTEGER PRIMARY KEY,
  name_thai TEXT NOT NULL,
  name_english TEXT,
  price_per_kg REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily transactions
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  fruit_id INTEGER REFERENCES fruits(id),
  weight_kg REAL NOT NULL,
  price_per_kg REAL NOT NULL,
  total_amount REAL NOT NULL,
  photo_path TEXT,
  qr_code_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at DATETIME
);

-- Daily summaries for accounting
CREATE TABLE daily_summaries (
  date TEXT PRIMARY KEY,
  total_transactions INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  top_fruit_id INTEGER REFERENCES fruits(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Fruit Presets (25+ fruits)

- Mango (มะม่วง), Rambutan (เงาะ), Mangosteen (มังคุด)
- Pineapple (สับปะรด), Dragon Fruit (แก้วมังกร)
- Durian (ทุเรียน), Papaya (มะละกอ), Longan (ลำไย)
- Lychee (ลิ้นจี่), Jackfruit (ขนุน), Coconut (มะพร้าว)
- And 14 more regional favorites...

### Daily Coordination Protocol

- **9:00 AM**: 15-minute sync on API contracts and interfaces
- **12:00 PM**: Quick check-in on progress and blockers
- **6:00 PM**: End-of-day integration testing
- **Git Strategy**: `feature/ui-*` and `feature/data-*` branches
- **Shared Files**: TypeScript interfaces, constants, utils

### Success Metrics

- [ ] App works 100% offline with SQLite storage
- [ ] OCR accurately reads digital scale displays (>85% accuracy)
- [ ] PromptPay QR codes generate correctly
- [ ] Thai UI is clear for low-tech users
- [ ] Daily accounting tracks revenue properly
- [ ] App supports Android 8+ devices

### Risk Mitigation

- **OCR fails**: Manual input fallback always available
- **Poor camera**: Image preprocessing and user guidance
- **Offline sync**: Queue transactions, sync when connected
- **User adoption**: Simple tutorial and fruit presets
- **Device compatibility**: Target Android 8+ with basic specs

---

**Ready to build WeighPay! 🥭📱💰**
