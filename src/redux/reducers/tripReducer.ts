// src/redux/reducers/tripsReducer.ts
import { Trip, TripAction, CREATE_TRIP_LOCAL, MARK_TRIP_CLEAN } from '../types/tripTypes';

export type TripsState = { items: Trip[] };
const initial: TripsState = { items: [] };

export const tripsReducer = (state = initial, action: TripAction): TripsState => {
  switch (action.type) {
    case CREATE_TRIP_LOCAL:
      return { ...state, items: [action.payload, ...state.items] };

    case MARK_TRIP_CLEAN:
      return {
        ...state,
        items: state.items.map(t =>
          t.tripId === action.payload.tripId ? { ...t, _dirty: false } : t
        ),
      };

    default:
      return state;
  }
};
