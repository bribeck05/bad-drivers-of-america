// Native-compatible notification helper
// Uses @capacitor/local-notifications on native, browser Notification API on web
import { LocalNotifications } from "@capacitor/local-notifications";
import { Geolocation } from "@capacitor/geolocation";

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Try native (Capacitor)
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  } catch {
    // Fall back to web Notification API
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
    return false;
  }
}

export async function getNotificationPermission(): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display === "granted";
  } catch {
    return "Notification" in window && Notification.permission === "granted";
  }
}

export async function sendNotification(title: string, body: string, tag?: string): Promise<void> {
  const granted = await getNotificationPermission();

  if (granted) {
    try {
      // Try native first
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title,
          body,
          smallIcon: "ic_launcher",
          iconColor: "#dc2626",
        }],
      });
      return;
    } catch {
      // Fall through to web
    }
  }

  // Web fallback
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      tag,
    });
  }
}

export interface GpsCoords {
  lat: number;
  lng: number;
}

export async function getCurrentPosition(): Promise<GpsCoords | null> {
  // Try native Capacitor Geolocation first
  try {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== "granted") {
      const req = await Geolocation.requestPermissions();
      if (req.location !== "granted") return null;
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    // Fall back to web Geolocation API
    if (!("geolocation" in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}

export async function checkGeolocationPermission(): Promise<boolean> {
  try {
    const { location } = await Geolocation.checkPermissions();
    return location === "granted";
  } catch {
    return "geolocation" in navigator;
  }
}
