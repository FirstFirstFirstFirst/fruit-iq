# Troubleshooting Guide

Quick reference for common React Native / Expo development issues.

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
| Clear Metro cache | `npx expo start --clear` |
| Clean Gradle | `cd android && ./gradlew clean && cd ..` |
| Clean prebuild | `npx expo prebuild --clean` |
| Full rebuild | `npx expo run:android` |
| Check installed versions | `npm ls react-native-reanimated` |

---

## Prevention Tips

1. **After `npm install` with native packages**: Always run `npx expo prebuild --clean`
2. **Before major updates**: Commit your changes first
3. **When switching branches**: Run clean prebuild if native packages differ
4. **Regular maintenance**: Occasionally do a full clean rebuild

---

*Last updated: 2025-11-25*
