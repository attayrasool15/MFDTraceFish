import NetInfo from '@react-native-community/netinfo';
import type { Dispatch } from 'redux';
import { enqueueTrip, markUploading, markUploaded, markError, hydrateQueue } from './tripQueueActions';
import { toCreateTripBody } from '../../screens/Fisherman/AddTrip/mappers';
import { createTrip as apiCreateTrip } from '../../services/trips';
import type { RootState } from '../store';
import type { TripDraft } from '../../screens/Fisherman/AddTrip/mappers';
import { createTripLocal, markTripClean } from './tripActions';
import { createLot } from '../../services/lots';
import { markLotClean } from './lotActions';

// --- helpers ---
function parseUploadError(e: any): string {
  const status = e?.status || e?.response?.status;
  const msg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Upload failed';
  if (status === 422) return `Validation failed: ${msg}`;
  if (status === 401 || status === 403) return `Unauthorized: ${msg}`;
  if (status >= 500) return `Server error: ${msg}`;
  return msg;
}

async function isOnline(): Promise<boolean> {
  try {
    const net = await NetInfo.fetch();
    return !!(net.isInternetReachable ?? net.isConnected);
  } catch {
    return false;
  }
}

function selectFishermanId(state: RootState): number | undefined {
  const u: any = (state as any).auth?.user;
  return u?.fisherman_id ?? u?.id ?? u?.user_id ?? undefined;
}

// Save locally (trips) + enqueue (queue) → sync if online
export const saveOrUploadTrip = (draft: TripDraft) => {
  return async (dispatch: Dispatch) => {
    // mirror locally for UX
    dispatch(createTripLocal({
      tripId: draft.tripId,
      fisherman_id: 2,
      boatNameId: draft.boatNameId,
      departure_port: draft.departure_port,
      destination_port: draft.destination_port,
      tripPurpose: draft.tripPurpose,
      targetSpecies: draft.targetSpecies,
      numCrew: draft.numCrew,
      numLifejackets: draft.numLifejackets,
      emergencyContact: draft.emergencyContact,
      seaType: draft.seaType,
      seaConditions: draft.seaConditions,
      tripCost: draft.tripCost,
      fuelCost: draft.fuelCost,
      estimatedCatch: draft.estimatedCatch,
      equipmentCost: draft.equipmentCost,
      gps: draft.gps,
      departureAt: draft.departureAt,
      arrivalAt: draft.arrivalAt,
      _dirty: true,
      createdAt: new Date().toISOString(),
    }));

    // enqueue for upload (plain trip job)
    // @ts-ignore thunk
    await dispatch(enqueueTrip(draft));

    if (await isOnline()) {
      // @ts-ignore thunk
      return dispatch(syncPendingTrips());
    }
  };
};

// Strict FIFO: process head only; STOP on first error
export const syncPendingTrips = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    if (!getState().tripQueue.queue.length) {
      // @ts-ignore
      await dispatch(hydrateQueue());
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const state = getState();
      const q = state.tripQueue.queue;
      if (!q.length) break;

      const head: any = q[0]; // queue item (may be plain trip or a bundle with lots[])
      if (head.status === 'uploading') break;

      // mark uploading
      // @ts-ignore
      await dispatch(markUploading(head.id));

      try {
        const fishermanId = selectFishermanId(getState());
        const draft: TripDraft = head.draft;

        // 1) Create Trip (add fisherman_id + trip_id fields required by backend)
        const body = toCreateTripBody(draft);
        (body as any).trip_id = draft.tripId;          // DB column observed in error
        (body as any).trip_name = draft.tripId;        // keep as well if API reads it
        if (fishermanId) (body as any).fisherman_id = fishermanId;

        const createdTrip = await apiCreateTrip(body);
        const serverTripId =
          (createdTrip as any)?.id ??
          (createdTrip as any)?.trip_id ??
          (createdTrip as any)?.data?.id;

        if (!serverTripId) {
          throw new Error('Trip created but server id missing');
        }

        // 2) If this job has lots, upload them sequentially
        const lots = Array.isArray(head.lots) ? head.lots : [];
        for (const lot of lots) {
          const lotBody = {
            trip_id: serverTripId,
            species: lot.species,
            weight: lot.weightKg,
            grade: lot.grade,
            price_per_kg: lot.pricePerKg,
          };
          await createLot(lotBody);
          // mark local lot clean
          // @ts-ignore
          await dispatch(markLotClean(lot.lotId));
        }

        // 3) Mark local trip clean and dequeue job
        // @ts-ignore
        await dispatch(markTripClean(draft.tripId));
        // @ts-ignore
        await dispatch(markUploaded(head.id));

        continue; // next head
      } catch (e: any) {
        const msg = parseUploadError(e);
        // @ts-ignore
        await dispatch(markError(head.id, msg));
        break; // STOP on first error (FIFO guarantee)
      }
    }
  };
};

// App bootstrap: hydrate + NetInfo listener to auto-sync
export const initBackgroundSync = () => {
  return async (dispatch: Dispatch) => {
    // @ts-ignore
    await dispatch(hydrateQueue());

    if (await isOnline()) {
      // @ts-ignore
      dispatch(syncPendingTrips());
    }

    NetInfo.addEventListener(state => {
      const online = !!(state.isInternetReachable ?? state.isConnected);
      if (online) {
        // @ts-ignore
        dispatch(syncPendingTrips());
      }
    });
  };
};

// import NetInfo from '@react-native-community/netinfo';
// import type { Dispatch } from 'redux';
// import { enqueueTrip, hydrateQueue } from './tripQueueActions';
// import type { RootState } from '../store';
// import type { TripDraft } from '../../screens/Fisherman/AddTrip/mappers';
// import { createTripLocal } from './tripActions';

// // 🔒 Kill switch: offline-only mode (no API calls)
// const OFFLINE_ONLY = true;

// // (kept for future use if you re-enable sync)
// async function isOnline(): Promise<boolean> {
//   try {
//     const net = await NetInfo.fetch();
//     return !!(net.isInternetReachable ?? net.isConnected);
//   } catch {
//     return false;
//   }
// }

// // Save locally (trips) + enqueue (queue) → DO NOT sync
// export const saveOrUploadTrip = (draft: TripDraft) => {
//   return async (dispatch: Dispatch) => {
//     // mirror locally for UX
//     dispatch(
//       createTripLocal({
//         tripId: draft.tripId,
//         captainName: draft.captainName,
//         boatNameId: draft.boatNameId,
//         departure_port: draft.departure_port,
//         destination_port: draft.destination_port,
//         tripPurpose: draft.tripPurpose,
//         targetSpecies: draft.targetSpecies,
//         numCrew: draft.numCrew,
//         numLifejackets: draft.numLifejackets,
//         emergencyContact: draft.emergencyContact,
//         seaType: draft.seaType,
//         seaConditions: draft.seaConditions,
//         tripCost: draft.tripCost,
//         fuelCost: draft.fuelCost,
//         estimatedCatch: draft.estimatedCatch,
//         equipmentCost: draft.equipmentCost,
//         gps: draft.gps,
//         departureAt: draft.departureAt,
//         arrivalAt: draft.arrivalAt,
//         _dirty: true,
//         createdAt: new Date().toISOString(),
//       }),
//     );

//     // enqueue for future upload
//     // @ts-ignore thunk
//     await dispatch(enqueueTrip(draft));
//     if (await isOnline()) {
//       // @ts-ignore thunk
//       return dispatch(syncPendingTrips());
//     }
//     // 🚫 No sync in offline-only mode
//     return;
//   };
// };

// // Strict FIFO sync — 🚫 disabled in offline-only mode
// export const syncPendingTrips = () => {
//   return async (_dispatch: Dispatch, _getState: () => RootState) => {
//     if (OFFLINE_ONLY) {
//       // Intentionally do nothing
//       return;
//     }
//     // (When you re-enable, drop back in your previous FIFO code here.)
//   };
// };

// // App bootstrap: hydrate queue; 🚫 do not auto-sync or add NetInfo listener
// export const initBackgroundSync = () => {
//   return async (dispatch: Dispatch) => {
//     // @ts-ignore
//     await dispatch(hydrateQueue());
//     // 🚫 No online check, no listener while offline-only
//   };
// };
