# Troubleshooting Guide

Quick reference for common React Native / Expo development issues.

---

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Expo Go vs Development Build](#expo-go-vs-development-build)
3. [Package.json Scripts](#packagejson-scripts)
4. [Native Module Version Mismatch](#native-module-version-mismatch)
5. [Metro Bundler Cache Issues](#metro-bundler-cache-issues)
6. [Gradle Build Failures](#gradle-build-failures)
7. [When to Rebuild Native Code](#when-to-rebuild-native-code)
8. [Quick Reference Commands](#quick-reference-commands)

---

## Development Workflow

### Daily Development (after initial setup)

```bash
# Start Metro bundler
npm run start
# or
npx expo start
```

Then open the app on your phone - it connects via network automatically.

### First Time Setup / After Native Package Changes

```bash
# Build and install dev client (only needed ONCE or when native packages change)
npx expo run:android
```

### The Key Concept

```
npx expo run:android  →  Build & install app (do ONCE)
npx expo start        →  Start Metro server (do EVERY TIME you develop)
```

---

## Expo Go vs Development Build

### Why You Can't Use Expo Go

This project uses **custom native modules** that are NOT included in Expo Go:
- `react-native-vision-camera`
- `react-native-worklets-core`
- `react-native-reanimated` (custom version)

**Expo Go** = Pre-built app with fixed native modules (like a demo app)
**Development Build** = Custom app with YOUR native modules (your own "Expo Go")

### Comparison

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Connect via network (IP:8081) | ✅ | ✅ |
| Hot reload / Fast refresh | ✅ | ✅ |
| See changes instantly | ✅ | ✅ |
| Custom native modules | ❌ | ✅ |
| Build time | 0 (pre-built) | ~10 min (once) |
| Rebuild frequency | Never | Only when native packages change |

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Metro Bundler (npx expo start)                     │   │
│  │  - Serves JavaScript code                           │   │
│  │  - Hot reload / Fast refresh                        │   │
│  │  - Runs on http://YOUR_IP:8081                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Network (WiFi)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       YOUR PHONE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Development Build (installed via run:android)      │   │
│  │  - Contains native code (C++, Java)                 │   │
│  │  - Camera, animations, etc.                         │   │
│  │  - Connects to Metro for JS updates                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### When to Rebuild

| Scenario | Action |
|----------|--------|
| Changed JS/TSX files | Just save - hot reload handles it |
| Added pure JS package (lodash, axios) | No rebuild needed |
| Added native package (camera, sqlite) | Must run `npx expo run:android` |
| Updated native package version | Must run `npx expo run:android` |
| First time setup | Must run `npx expo run:android` |

---

## Package.json Scripts

### Available Scripts

```bash
npm run start          # Start Metro bundler for development
npm run start:clear    # Start Metro with cleared cache
npm run android        # Build and run on Android (npx expo run:android)
npm run ios            # Build and run on iOS (npx expo run:ios)
npm run web            # Start web version
npm run lint           # Check code for errors
npm run lint:fix       # Auto-fix linting errors
npm run typecheck      # Check TypeScript types
npm run clean          # Clean and regenerate native folders
```

### When to Use Each

| Task | Command |
|------|---------|
| Daily development | `npm run start` |
| Clear cache issues | `npm run start:clear` |
| First time / native changes | `npm run android` |
| Before committing | `npm run lint:fix && npm run lint && npm run typecheck` |
| Full clean rebuild | `npm run clean && npm run android` |

---

## Native Module Version Mismatch

### Symptoms

```
[WorkletsError: Mismatch between JavaScript part and native part of Worklets (X.X.X vs Y.Y.Y)]
```

Or similar errors mentioning:
- `react-native-reanimated` version mismatch
- `react-native-gesture-handler` mismatch
- Native module initialization failed
- Subsequent errors like `useAuth must be used within AuthProvider` (caused by app crash during init)

### Root Cause

React Native packages have **two parts**:
1. **JavaScript code** - updated when you run `npm install`
2. **Native code** (C++/Java/Kotlin) - compiled into the APK/IPA

When you install/update packages, only the JS part updates. The native binaries remain cached from the previous build, causing a version mismatch.

### Solution

Run these commands **in order**:

```bash
# 1. Clear Expo cache
rm -rf .expo

# 2. Delete node_modules and lock file
rm -rf node_modules
rm package-lock.json

# 3. Reinstall dependencies
npm install

# 4. Clean prebuild (regenerates android/ folder)
npx expo prebuild --clean

# 5. Rebuild the app
npx expo run:android
```

### One-Liner (Windows PowerShell)

```powershell
rm -r -fo .expo; rm -r -fo node_modules; rm package-lock.json; npm install; npx expo prebuild --clean; npx expo run:android
```

### One-Liner (macOS/Linux)

```bash
rm -rf .expo node_modules package-lock.json && npm install && npx expo prebuild --clean && npx expo run:android
```

---

## Metro Bundler Cache Issues

### Symptoms

- Stale code being bundled
- Changes not reflecting
- "Module not found" for existing files
- False warnings about missing exports

### Solution

```bash
# Clear Metro cache and restart
npx expo start --clear
# or
npm run start:clear
```

Or manually:

```bash
rm -rf .expo
rm -rf node_modules/.cache
npx expo start
```

---

## Gradle Build Failures

### Symptoms

- Build fails with CMake errors
- `externalNativeBuildClean` failures
- JNI linking errors

### Solution

```bash
# Clean Gradle caches
cd android
./gradlew clean
cd ..

# If that fails, do a full clean prebuild
npx expo prebuild --clean
npx expo run:android
```

### Nuclear Option (when nothing else works)

```bash
# Delete everything and start fresh
rm -rf .expo
rm -rf node_modules
rm -rf android
rm -rf ios
rm package-lock.json
npm install
npx expo prebuild --clean
npx expo run:android
```

---

## When to Rebuild Native Code

**Always rebuild after installing/updating these packages:**

| Package | Has Native Code |
|---------|-----------------|
| `react-native-reanimated` | Yes |
| `react-native-gesture-handler` | Yes |
| `react-native-vision-camera` | Yes |
| `react-native-worklets-core` | Yes |
| `expo-camera` | Yes |
| `expo-sqlite` | Yes |
| `expo-secure-store` | Yes |
| Any package with "native" in name | Likely yes |

**Safe packages (no rebuild needed):**
- Pure JS libraries (lodash, date-fns, axios)
- React hooks libraries
- Utility/helper libraries
- Type definition packages (@types/*)

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Start development | `npm run start` |
| Start with clean cache | `npm run start:clear` |
| Build & install app | `npx expo run:android` |
| Clear Metro cache | `npx expo start --clear` |
| Clean Gradle | `cd android && ./gradlew clean && cd ..` |
| Clean prebuild | `npx expo prebuild --clean` |
| Full rebuild | `npm run clean && npm run android` |
| Check installed versions | `npm ls react-native-reanimated` |
| Lint & typecheck | `npm run lint:fix && npm run lint && npm run typecheck` |

---

## Common Mistakes

### Mistake 1: Using Expo Go with custom native modules
**Problem:** App crashes with version mismatch errors
**Solution:** Build a development client with `npx expo run:android`

### Mistake 2: Running `run:android` every time
**Problem:** Wasting 10 minutes on unnecessary builds
**Solution:** Only run once. Use `npm run start` for daily development.

### Mistake 3: Not rebuilding after native package changes
**Problem:** Version mismatch between JS and native code
**Solution:** Run `npx expo run:android` after adding/updating native packages

### Mistake 4: Forgetting to clean before rebuild
**Problem:** Old cached native code causes issues
**Solution:** Run `npx expo prebuild --clean` before `run:android`

---

## Prevention Tips

1. **After `npm install` with native packages**: Always run `npx expo prebuild --clean && npx expo run:android`
2. **Before major updates**: Commit your changes first
3. **When switching branches**: Run clean prebuild if native packages differ
4. **Regular maintenance**: Occasionally do a full clean rebuild

---

*Last updated: 2025-11-25*
