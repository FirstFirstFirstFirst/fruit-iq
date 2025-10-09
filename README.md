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

## Build Options

### Option 1: Local Development Builds (Prebuild Required)

This app uses native modules (Camera, Vision Camera, etc.) and requires prebuild to generate native code.

```bash
# 1. Generate native code (android/ios folders)
npx expo prebuild

# 2. Build and run on Android
npx expo run:android

# 3. Build and run on iOS (macOS only)
npx expo run:ios

# Clean prebuild (if needed)
npm run clean
```

### Option 2: EAS Build (Cloud Builds - Recommended)

EAS Build handles prebuild automatically and builds in the cloud.

```bash
# Development build (with dev client)
eas build --profile development --platform android
eas build --profile development --platform ios

# Preview build (APK for testing)
eas build --profile preview --platform android

# Production build (App Bundle for Play Store)
eas build --profile production --platform android
eas build --profile production --platform ios
```

**Note**: First time using EAS Build requires login: `eas login`

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
