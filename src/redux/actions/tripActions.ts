// src/redux/actions/tripActions.ts
import { CREATE_TRIP_LOCAL, MARK_TRIP_CLEAN, Trip, TripAction } from '../types/tripTypes';

export const createTripLocal = (trip: Trip): TripAction => ({
  type: CREATE_TRIP_LOCAL,
  payload: trip,
});

export const markTripClean = (tripId: string): TripAction => ({
  type: MARK_TRIP_CLEAN,
  payload: { tripId },
});
