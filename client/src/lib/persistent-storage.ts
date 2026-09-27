// Safe persistent storage — works in web (in-memory fallback) and native (Capacitor Preferences)
import { Preferences } from "@capacitor/preferences";

const memoryStore: Record<string, string> = {};

export const persistentStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return memoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch {
      memoryStore[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch {
      delete memoryStore[key];
    }
  },
};
