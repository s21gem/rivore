import { create } from 'zustand';

interface SettingsState {
  settings: any | null;
  loading: boolean;
  lastFetched: number;
  fetchSettings: () => Promise<any>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  lastFetched: 0,

  fetchSettings: async () => {
    const state = get();
    const now = Date.now();

    // Return cached if fresh
    if (state.settings && now - state.lastFetched < CACHE_TTL) {
      return state.settings;
    }

    // Prevent duplicate fetches
    if (state.loading) {
      // Wait for existing fetch
      return new Promise((resolve) => {
        const check = setInterval(() => {
          const s = get();
          if (!s.loading) {
            clearInterval(check);
            resolve(s.settings);
          }
        }, 100);
      });
    }

    set({ loading: true });
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        set({ settings: data, lastFetched: Date.now(), loading: false });
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
    set({ loading: false });
    return state.settings;
  },
}));
