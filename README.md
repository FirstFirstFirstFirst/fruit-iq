# WeighPay - Fruit-IQ App

A React Native Expo app for managing fruit weighing and payment operations with PromptPay integration. Built with TypeScript, NativeWind v4, and Expo Router.

## Architecture

- **Frontend**: React Native (Expo SDK 54) with New Architecture enabled
- **Backend**: NestJS API at https://dapi.werapun.com
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind v4 (TailwindCSS)
- **State**: Custom hooks with API integration
- **Authentication**: JWT tokens via SecureStore

## Prerequisites

- Node.js (LTS version)
- npm or yarn
- For Android: Android Studio & Android SDK
- For iOS: macOS with Xcode
- EAS CLI for cloud builds: `npm install -g eas-cli`

## Installation

```bash
npm install
```

## Development Workflow

### 🟢 Local Development (Daily Work)

For regular development where you're just changing JavaScript/TypeScript code:

**Step 1: One-time setup** (or when native dependencies change)
```bash
# Install dependencies
npm install

# Build and install debug APK on emulator/device (takes 2-3 minutes)
cd android && ./gradlew installDebug
cd ..
```

**Step 2: Start Metro bundler** (every time you develop)
```bash
# Metro server will hot-reload your JS/TS changes
# Ask for logs instead of running this yourself (per project rules)
```

**When do you need to rebuild?**
- ✅ First time setup
- ✅ After `npm install` (especially when native modules update)
- ✅ After running `npx expo prebuild --clean`
- ✅ When you see "Mismatch between JavaScript part and native part" errors
- ❌ NOT needed for regular JS/TS code changes (hot reload works)

### 🔴 Building Release APK (For Distribution)

When you need to share/deploy the actual APK file:

```bash
# Generate native code
npx expo prebuild --clean

# Build release APK (takes 10+ minutes)
cd android && ./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### ☁️ EAS Build (Cloud Builds - Alternative)

EAS Build handles everything in the cloud (no local Android Studio needed).

```bash
# Development build (with dev client)
eas build --profile development --platform android

# Preview build (APK for testing)
eas build --profile preview --platform android

# Production build (App Bundle for Play Store)
eas build --profile production --platform android
```

**Note**: First time using EAS Build requires login: `eas login`

## Build Types Explained

| Build Type | Command | Time | Use Case |
|------------|---------|------|----------|
| **Debug (installDebug)** | `./gradlew installDebug` | 2-3 min | Local development, connects to Metro for hot reload |
| **Release (assembleRelease)** | `./gradlew assembleRelease` | 10+ min | Production APK, all JS bundled inside |
| **EAS Cloud** | `eas build --profile [profile]` | 15-20 min | Cloud builds, no local setup needed |

## Troubleshooting Native Modules

If you see version mismatch errors (e.g., "worklets 0.6.1 vs 0.5.1"):

```bash
# 1. Clean everything
rm -rf node_modules
rm -rf .expo
rm -rf android/app/build android/build

# 2. Reinstall
npm install

# 3. Regenerate native code
npx expo prebuild --clean

# 4. Rebuild and install debug APK
cd android && ./gradlew installDebug
```

## Development

```bash
# Start development server (DO NOT RUN - check logs instead)
# npm start

# Start with cache cleared
npm run start:clear

# Run with backend (full dev environment)
npm run dev

# Run backend only
npm run backend

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Quality Checks

Before committing, always run:

```bash
npm run lint:fix
npm run lint
npm run typecheck
```

## Project Structure

```
app/                    # Expo Router screens
├── (tabs)/            # Tab navigation
├── _layout.tsx        # Root layout
└── +not-found.tsx     # 404 screen

src/
├── components/        # Reusable UI components
│   ├── ui/           # Base components
│   └── [feature]/    # Feature components
├── lib/              # Core utilities
│   ├── api.ts        # API client
│   ├── utils.ts      # Helper functions
│   ├── promptpay.ts  # PromptPay QR generation
│   └── constants.ts  # App constants
├── hooks/            # Custom hooks (useApi, etc.)
├── data/             # TypeScript interfaces
└── contexts/         # React contexts

assets/               # Static files (fonts, images)
```

## Key Features

- Thai fruit management system
- Real-time weight tracking
- PromptPay QR code generation
- Camera integration for fruit identification
- Transaction history with filtering
- Multi-farm support
- Offline-capable architecture

## Tech Stack

- React Native 0.81.4 (New Architecture)
- Expo SDK 54
- TypeScript 5.9
- NativeWind v4
- Expo Router 6
- React Navigation 7
- Expo Camera & Vision Camera
- Kanit font family (Thai support)

## Backend Integration

Backend source: `E:\DurianFarm\durico-web-backend\durico-nest-backend\`

API endpoints are managed through `src/lib/api.ts` with custom hooks in `src/hooks/useApi.ts`.

## Build Types

- **Development**: Debug build with dev client for testing native modules
- **Preview**: APK for internal testing and sharing
- **Production**: Optimized build for app stores (App Bundle for Android, IPA for iOS)

## Notes

- This app is in precustomer production prototype stage
- Never run migrations on backend Prisma schema (only add relations)
- Authentication tokens stored securely in SecureStore
- Always check for library conflicts when adding dependencies
- Ask for logs instead of running expo start/run commands directly

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [NativeWind v4](https://www.nativewind.dev/)

## Contact & Support

For questions, support, or privacy concerns:
- **Email**: durico888@gmail.com
- **Company**: DURICO
- **Team**: Asst.Prof. Dr.Warodom Werapun, Dr. Thitinan Kriangsuwan, Mr. Sakon Buthong, Mr. Siriphong Chotirat
- **Address**: Prince of Songkla University, Phuket Campus, Thailand
- **Privacy Policy**: https://durico-web.vercel.app/privacy?app=weighpay
