# Google Play Release Guide - WeighPay

## App Information

- **App Name**: WeighPay
- **Package ID**: `com.anonymous.weighpay`
- **Version**: 1.0.0 (versionCode: 1)
- **Build Type**: Android App Bundle (.aab)

## Production Keystore Details

### Keystore Information
```
Keystore File: android/app/weighpay-upload.keystore
Keystore Type: PKCS12
Key Algorithm: RSA
Key Size: 2048 bits
Validity: 10,000 days (~27 years)
```

### Credentials (KEEP SECURE!)
```
Store Password: WeighPay2025@Secure
Key Alias: weighpay-key
Key Password: WeighPay2025@Secure
```

### Certificate Details
```
Common Name (CN): WeighPay
Organizational Unit (OU): Mobile
Organization (O): WeighPay
Locality (L): Bangkok
State (ST): Bangkok
Country (C): TH
```

## Build Configuration

### Files Modified
1. `android/app/build.gradle` - Added release signing configuration
2. `android/gradle.properties` - Added keystore credentials

### Signing Configuration
The release build now uses the production keystore located at:
```
android/app/weighpay-upload.keystore
```

## How to Build .aab for Google Play

### Method 1: Local Build (Recommended)

```bash
# Navigate to android directory
cd android

# Clean build (optional but recommended)
./gradlew clean

# Build the .aab file
./gradlew bundleRelease
```

The `.aab` file will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Method 2: Windows Command

```cmd
cd android
gradlew.bat bundleRelease
```

## Pre-Release Checklist

Before uploading to Google Play Console:

- [ ] Update version number in `app.json` and `android/app/build.gradle`
- [ ] Test the app thoroughly on physical devices
- [ ] Run linting and type checking:
  ```bash
  npm run lint:fix
  npm run lint
  npm run typecheck
  ```
- [ ] Verify the package name is correct (consider changing from `com.anonymous.weighpay`)
- [ ] Prepare app store assets (screenshots, description, etc.)
- [ ] Review permissions in `app.json`
- [ ] Test QR code generation and camera functionality

## Version Management

### Updating Version for New Releases

1. **Update app.json**:
   ```json
   {
     "expo": {
       "version": "1.1.0"
     }
   }
   ```

2. **Update android/app/build.gradle**:
   ```gradle
   defaultConfig {
       versionCode 2  // Increment by 1
       versionName "1.1.0"
   }
   ```

## Google Play Console Upload

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing app
3. Navigate to: Production > Create new release
4. Upload the `.aab` file from: `android/app/build/outputs/bundle/release/app-release.aab`
5. Fill in release notes
6. Review and publish

## Important Security Notes

### Keystore Backup
- **CRITICAL**: Back up `weighpay-upload.keystore` to a secure location
- Store credentials in a password manager
- Never commit keystore to version control
- If you lose this keystore, you cannot update the app on Google Play

### Recommended Backup Locations
- Secure cloud storage (encrypted)
- External encrypted drive
- Company password manager/vault

### .gitignore Protection
The entire `/android` directory is already in `.gitignore`, which protects:
- `weighpay-upload.keystore`
- `gradle.properties` (with credentials)

## Troubleshooting

### Build Fails with Signing Error
- Verify keystore file exists at `android/app/weighpay-upload.keystore`
- Check credentials in `android/gradle.properties`
- Ensure passwords match exactly

### APK vs AAB
- **APK**: For local testing and distribution
- **AAB**: Required for Google Play Store (smaller download size, optimized)

### Clean Build
If you encounter caching issues:
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

## Future Considerations

### Package Name Change
Consider changing from `com.anonymous.weighpay` to:
- `com.yourcompany.weighpay`
- `com.durico.weighpay`
- Or your actual domain-based package name

This must be done BEFORE first Google Play upload, as package names cannot be changed after publication.

## Build Output Location

After successful build:
```
android/app/build/outputs/bundle/release/app-release.aab
```

File size: Typically 20-50 MB (varies based on app content)

## Next Steps After Setup

1. Run the build command to generate your first .aab
2. Test the signed release build
3. Prepare Google Play Console listing
4. Upload and submit for review

---

**Generated**: 2025-11-18
**Last Updated**: 2025-11-18
