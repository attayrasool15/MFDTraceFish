// src/redux/actions/tripActions.ts
import { CREATE_TRIP_LOCAL, Trip, TripAction } from '../types/tripTypes';

export const createTripLocal = (trip: Trip): TripAction => ({
  type: CREATE_TRIP_LOCAL,
  payload: trip,
});
