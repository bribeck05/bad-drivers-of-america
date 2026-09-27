# Bad Drivers of America

A community-driven app for reporting and viewing bad drivers. Users can upload photos and videos of drivers and their vehicles, add location, license plate number, make and model — and get notified when bad drivers are reported nearby.

## Features

- **Report bad drivers** — Upload photos/videos with location, license plate, make, and model
- **Community feed** — Browse reports from other users with like/dislike voting
- **Comments** — Open commenting on any report (no account required to comment)
- **Location-based alerts** — Get notified when a bad driver is reported within your chosen radius
- **Adjustable radius** — Set alert distance from 5 to 100 miles, saved per device
- **Authentication** — Token-based auth with bcrypt password hashing
- **Rate limiting** — In-memory rate limiter to prevent spam and abuse
- **Guest mode** — Browse the full feed without creating an account
- **PWA** — Installable on any phone via "Add to Home Screen"
- **Native apps** — Capacitor builds for Android and iOS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: SQLite (via better-sqlite3)
- **Auth**: Token-based with bcryptjs
- **Native**: Capacitor (Android + iOS)
- **PWA**: Service worker, web manifest, offline support

## Quick Access

Scan this QR code to open the app on your phone:

![QR Code](builds/qr-code.png)

Or visit: **https://bad-drivers-of-america.pplx.app**

### Install on iPhone (iOS)

You must use **Safari** — the "Add to Home Screen" feature is not available in other browsers like Chrome or Firefox.

1. Open **Safari** on your iPhone
2. Go to **https://bad-drivers-of-america.pplx.app**
3. Wait for the page to fully load
4. Tap the **Share button** (square icon with an arrow pointing up, at the bottom of the screen)
5. Scroll down the Share Sheet and tap **Add to Home Screen**
6. Tap **Add** in the top right corner

The app icon will appear on your home screen. Tapping it opens the app full-screen — no address bar, just like a native app.

> **Tip:** If you don't see "Add to Home Screen," make sure you're in Safari (not an in-app browser). Swipe left on the actions row if the option is off-screen.

### Install on Android

You can use **Chrome** or **Edge** to install the app.

**Using Chrome:**
1. Open **Chrome** on your Android phone
2. Go to **https://bad-drivers-of-america.pplx.app**
3. Wait for the page to fully load
4. Tap the **three-dot menu** in the top right corner
5. Tap **Add to Home screen** (or **Install app** if the prompt appears)
6. Tap **Add** to confirm

**Using Edge:**
1. Open **Edge** on your Android phone
2. Go to **https://bad-drivers-of-america.pplx.app**
3. Tap the **three-dot menu** in the bottom right corner
4. Tap **Add to phone** > **Add to Home screen**
5. Tap **Add** to confirm

The app icon will appear on your home screen. Tapping it opens the app full-screen with no browser UI.

> **Tip:** On newer Android versions, Chrome may show an "Install app" prompt automatically when you visit the site. Tap it to install.

### Alternative: Install via APK (Android only)

If you prefer not to use a browser, you can install the debug APK directly:

1. Download the `bad-drivers-debug.apk` from the `builds/` folder
2. Transfer it to your Android phone
3. Open the file on your phone (you may need to enable "Install from unknown sources" in Settings)
4. Tap **Install**

## Project Structure

```
bad-drivers/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (auth provider, etc.)
│   │   ├── pages/       # Feed, auth, create report, report detail
│   │   └── lib/         # API client, native helpers, persistent storage
│   └── public/          # PWA manifest, service worker, icons
├── server/              # Express backend
│   ├── routes.ts        # API routes (auth, reports, comments, votes, nearby)
│   ├── storage.ts       # SQLite storage layer
│   └── index.ts         # Express app setup
├── shared/              # Shared schema types
├── android/             # Capacitor Android project
├── ios/                 # Capacitor iOS project
├── builds/              # Built APK, AAB, and QR code
├── capacitor.config.ts  # Capacitor configuration
├── NATIVE-BUILD-GUIDE.md # Guide for Play Store and App Store submission
└── script/              # Build scripts
```

## Native Permissions

| Permission | Platform | Purpose |
|---|---|---|
| Location (fine + coarse) | Android + iOS | Nearby driver alerts |
| Notifications | Android + iOS | Push notifications for nearby reports |
| Vibrate | Android | Haptic feedback on alerts |
| Internet | Android + iOS | Connect to backend API |

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npx cap sync         # Sync web build into native projects
```

## Building Native Apps

See [NATIVE-BUILD-GUIDE.md](NATIVE-BUILD-GUIDE.md) for full instructions on building for Google Play Store and Apple App Store.

### Android

```bash
cd android
./gradlew assembleDebug    # Debug APK
./gradlew bundleRelease     # Release AAB for Play Store
```

### iOS (requires macOS)

```bash
npx cap open ios            # Open in Xcode
# Then: Product > Archive > Distribute App
```

## License

Private project. All rights reserved.
