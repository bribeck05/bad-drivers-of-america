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

### Install on your phone

**iPhone (Safari):**
1. Open the link in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android (Chrome):**
1. Open the link in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home screen"

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
