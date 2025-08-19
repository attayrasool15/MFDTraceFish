import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateTripBody } from '../services/trips';

const KEY = 'offline_trips_v1';

export type QueuedTrip = {
  localId: string;               // use trip_name (e.g. TRIP-2025...)
  body: CreateTripBody;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

async function loadQueue(): Promise<QueuedTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedTrip[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(list: QueuedTrip[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function listQueuedTrips() {
  return loadQueue();
}

export async function enqueueTrip(localId: string, body: CreateTripBody) {
  const list = await loadQueue();
  // de-dupe by localId (trip_name)
  const without = list.filter(t => t.localId !== localId);
  without.push({
    localId,
    body,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  await saveQueue(without);
}

export async function removeTrip(localId: string) {
  const list = await loadQueue();
  const next = list.filter(t => t.localId !== localId);
  await saveQueue(next);
}

export async function markTripError(localId: string, msg: string) {
  const list = await loadQueue();
  const next = list.map(t =>
    t.localId === localId
      ? { ...t, lastError: msg, attempts: (t.attempts ?? 0) + 1 }
      : t
  );
  await saveQueue(next);
}
