import type { Dispatch } from 'redux';
import type { RootState } from '../store';
import { enqueueTrip } from './tripQueueActions'; // uses the persisted enqueue we added
import { LotDraft } from '../types/lotTypes';

// Build and enqueue a bundle for a given local tripId
export const buildAndEnqueueTripBundle = (tripId: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const s = getState();
    const trip = (s.trips.items || []).find(t => t.tripId === tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found locally`);

    const lots: LotDraft[] = (s.lots.items || []).filter(l => l.tripId === tripId);

    const job = {
      kind: 'trip_bundle' as const,
      id: `${tripId}:${Date.now()}`,
      draft: trip,                 // you can use the TripDraft instead; this is enough
      lots,
      status: 'queued' as const,
      error: null,
      createdAt: new Date().toISOString(),
      progress: { uploadedLots: 0, totalLots: lots.length },
    };

    // Reuse enqueueTrip thunk to persist (it accepts any payload; if yours is strict, add a new enqueue action)
    // @ts-ignore
    await dispatch(({ type: 'QUEUE_ENQUEUE', payload: job }));
    // Also persist via saveQueueToStorage inside your action (as in previous patch)
  };
};
