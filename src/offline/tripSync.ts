import NetInfo from '@react-native-community/netinfo';
import { createTrip, type CreateTripBody, type Trip } from '../services/trips';
import { enqueueTrip, listQueuedTrips, removeTrip, markTripError } from './tripQueue';

function isNetworkish(err: any) {
  const msg = String(err?.message || '');
  return msg.includes('Network request failed') || err?.status === 0;
}

/** Try to upload now; if offline or network error, queue it. */
export async function saveOrUploadTrip(localId: string, body: CreateTripBody):
  Promise<{ queued: boolean; trip?: Trip }> {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    await enqueueTrip(localId, body);
    return { queued: true };
  }
  try {
    const trip = await createTrip(body);
    return { queued: false, trip };
  } catch (err: any) {
    if (isNetworkish(err)) {
      await enqueueTrip(localId, body);
      return { queued: true };
    }
    throw err; // validation or server error
  }
}

/** Attempt to upload all queued trips (stop early if we lose network again). */
export async function syncQueuedTrips() {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    const remaining = (await listQueuedTrips()).length;
    return { uploaded: 0, remaining };
  }

  const queue = await listQueuedTrips();
  let uploaded = 0;

  for (const item of queue) {
    try {
      await createTrip(item.body);
      await removeTrip(item.localId);
      uploaded++;
    } catch (err: any) {
      if (isNetworkish(err)) break;            // wait for better connectivity
      await markTripError(item.localId, String(err?.message || 'Error')); // keep & annotate
    }
  }
  const remaining = (await listQueuedTrips()).length;
  return { uploaded, remaining };
}

/** Set up listeners for automatic syncing when connection returns. */
export function initTripSync() {
  // Kick one sync on init
  syncQueuedTrips().catch(() => {});
  // Listen for connectivity becoming true
  const unsub = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncQueuedTrips().catch(() => {});
    }
  });
  return () => unsub();
}
