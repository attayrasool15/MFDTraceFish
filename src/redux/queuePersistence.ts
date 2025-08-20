import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from './store';

const KEY = 'trip_queue_v1';

export async function loadQueueFromStorage(): Promise<any[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveQueueToStorage(getState: () => RootState) {
  try {
    const q = getState().tripQueue.queue;
    await AsyncStorage.setItem(KEY, JSON.stringify(q));
  } catch {}
}
