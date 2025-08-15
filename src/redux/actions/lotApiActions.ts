// src/redux/actions/lotApiActions.ts
import { Dispatch } from 'redux';
import { createLotLocal } from './lotActions';
import { Lot } from '../types/tripTypes';
import { api, upload } from '../../services/https';

export const getLots = (page = 1, perPage = 15, status?: string, species?: string, search?: string) => {
  return async () => {
    const json = await api('/fish-lots', { query: { page, per_page: perPage, status, species, search } });
    return json?.data;
  };
};

export const createLot = (lot: Lot & { tripServerId?: number }) => {
  return async (dispatch: Dispatch) => {
    dispatch(createLotLocal(lot)); // offline-first

    try {
      // 1) create lot JSON
      const payload = {
        trip_id: lot.tripServerId ?? 1, // TODO map when you have server trip id
        lot_number: lot.lotNo,
        species: lot.species,
        weight: lot.weightKg,
        grade: lot.grade,
        catch_date: lot.capturedAt.slice(0, 10),
        catch_location: lot.gps ? `Lat ${lot.gps.lat}, Lng ${lot.gps.lng}` : 'Unknown',
        fishing_method: 'N/A',
        price_per_kg: 0,
        total_value: 0,
        notes: '',
      };
      const created = await api('/fish-lots', { method: 'POST', body: payload });

      // 2) optional photo upload
      if (lot.photoLocalPath && created?.data?.id) {
        const form = new FormData();
        form.append('photo', {
          // @ts-ignore RN file type
          uri: lot.photoLocalPath,
          name: 'lot.jpg',
          type: 'image/jpeg',
        });
        form.append('caption', 'Lot photo');
        await upload(`/trips/${created.data.trip_id}/upload-photo`, form);
      }
    } catch (e) {
      // keep offline; sync later
    }
  };
};
