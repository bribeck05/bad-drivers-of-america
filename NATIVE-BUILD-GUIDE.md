# Bad Drivers of America — Native App Build Guide

This guide walks you through building the app for Google Play Store and Apple App Store.

## Prerequisites

### For Android:
- **Android Studio** (free, runs on Windows/Mac/Linux): https://developer.android.com/studio
- **Google Play Developer account** ($25 one-time fee): https://play.google.com/console

### For iOS:
- **Mac computer** (required — Xcode only runs on macOS)
- **Xcode** (free from Mac App Store)
- **Apple Developer Program membership** ($99/year): https://developer.apple.com/programs

---

## Step 1: Install Dependencies

```bash
cd bad-drivers
npm ci
```

## Step 2: Build the Web App

```bash
npm run build
```

This produces the web bundle in `dist/public/` which Capacitor packages into the native apps.

## Step 3: Sync Native Projects

```bash
npx cap sync
```

This copies the web build and plugin code into the `android/` and `ios/` folders.

---

## Building for Android (Google Play Store)

### Option A: Build APK/AAB directly from command line
```bash
cd android
./gradlew assembleDebug       # Debug APK for testing
./gradlew bundleRelease        # Release AAB for Play Store
```
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Option B: Use Android Studio
```bash
npx cap open android
```
This opens the project in Android Studio. From there:
1. Click **Build > Generate Signed Bundle / APK**
2. Choose **Android App Bundle** (required for Play Store)
3. Create or select a keystore (keep this safe — you need it for all future updates)
4. Select **release** build variant
5. Click **Finish** and wait for the build

### Upload to Google Play
1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing (description, screenshots, etc.)
4. Upload the `.aab` file under **Production > Create release**
5. Submit for review (usually approved within 1-3 days)

---

## Building for iOS (Apple App Store)

### Open in Xcode
```bash
npx cap open ios
```

### In Xcode:
1. Select the **App** target in the project navigator
2. Under **Signing & Capabilities**:
   - Select your Development Team (requires Apple Developer account)
   - Set a unique Bundle Identifier (e.g., `com.baddrivers.america`)
3. Click **Product > Archive** to create a release build
4. After archiving, click **Distribute App** and choose **App Store Connect**

### Upload to App Store
1. Go to https://appstoreconnect.apple.com
2. Create a new app (matching your Bundle ID)
3. Fill in App Information, Screenshots, Description
4. Under **App Store > Submit for Review**
5. Wait for Apple's review (usually 1-7 days)

---

## App Configuration

- **App ID**: `com.baddrivers.america`
- **App Name**: Bad Drivers of America
- **Backend URL**: The app loads from the live site at `https://bad-drivers-of-america.pplx.app`
- **Icons**: Pre-generated in `resources/` and installed in both native projects

## Updating the App After Changes

After making code changes:
```bash
npm run build          # Rebuild web app
npx cap sync           # Sync into native projects
npx cap open android   # Rebuild native
npx cap open ios       # Rebuild native
```

## PWA (Progressive Web App)

The app is also a PWA — users can visit the site on their phone and tap
"Add to Home Screen" for an app-like experience without going through
any app store. This works on both Android and iOS.
