// src/redux/actions/tripApiActions.ts
import { Dispatch } from 'redux';
import { createTripLocal } from './tripActions'; // your local reducer action
import type { Trip } from '../types/tripTypes';
import { api } from '../../services/https';

export const getTrips = (page = 1, perPage = 15, status?: string, search?: string) => {
  return async () => {
    const json = await api('/trips', { query: { page, per_page: perPage, status, search } });
    return json?.data;
  };
};

// Create trip on server (best effort) + always save locally for offline UX
export const createTrip = (localTrip: Trip) => {
  return async (dispatch: Dispatch) => {
    // fire-and-forget to local first
    dispatch(createTripLocal(localTrip));

    // try server
    try {
      const body = {
        trip_name: localTrip.tripId,                       // human-friendly name from your ID
        boat_id: 1,                                        // TODO: map from boatNameId (need a boat lookup)
        departure_port: localTrip.port,
        destination_port: localTrip.port,                  // TODO: add destination to form
        departure_date: localTrip.departureAt.slice(0, 10),
        expected_return_date: null,                        // TODO: add to form
        crew_size: localTrip.numCrew,
        fishing_method: localTrip.tripPurpose || 'N/A',
        target_species: localTrip.targetSpecies,
        estimated_catch: 0,
        fuel_cost: localTrip.tripCost || 0,
        crew_cost: 0,
        equipment_cost: 0,
        other_costs: 0,
        notes: '',
      };
      await api('/trips', { method: 'POST', body });
      // optionally dispatch a success toast / mark clean on next sync
    } catch (e) {
      // keep offline; a sync worker can retry later
    }
  };
};

export const updateTripLocation = (tripServerId: number, lat: number, lng: number, name?: string) => {
  return async () => {
    await api(`/trips/${tripServerId}/update-location`, {
      method: 'POST',
      body: {
        current_latitude: lat,
        current_longitude: lng,
        current_location: name || 'Current position',
      },
    });
  };
};
