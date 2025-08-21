import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'last_gps_fix_v1';

export type LastFix = {
  lat: number;
  lng: number;
  ts: number; // epoch ms
  accuracy?: number;
  source?: 'gps' | 'cache' | 'manual';
};

export async function saveLastFix(fix: LastFix) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(fix)); } catch {}
}

export async function readLastFix(): Promise<LastFix | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (typeof obj?.lat === 'number' && typeof obj?.lng === 'number') return obj;
    return null;
  } catch { return null; }
}

export async function clearLastFix() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
