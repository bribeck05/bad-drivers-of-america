import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.baddrivers.america",
  appName: "Bad Drivers of America",
  webDir: "dist/public",
  bundledWebRuntime: false,
  server: {
    // Use the live backend API when running as a native app
    url: "https://bad-drivers-of-america.pplx.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0f172a",
      showSpinner: false,
    },
    Preferences: {
      group: "bad-drivers",
    },
  },
};

export default config;
