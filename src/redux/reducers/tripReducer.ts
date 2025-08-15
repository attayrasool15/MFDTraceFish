// src/redux/reducers/tripsReducer.ts
import { Trip, TripAction, CREATE_TRIP_LOCAL } from '../types/tripTypes';

export type TripsState = {
  items: Trip[];
};

const initial: TripsState = { items: [] };

export const tripsReducer = (state = initial, action: TripAction): TripsState => {
  switch (action.type) {
    case CREATE_TRIP_LOCAL:
      return { ...state, items: [action.payload, ...state.items] };
    default:
      return state;
  }
};
