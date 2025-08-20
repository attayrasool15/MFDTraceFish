import {
  QUEUE_REPLACE, QUEUE_ENQUEUE, QUEUE_MARK_UPLOADING, QUEUE_MARK_UPLOADED,
  QUEUE_MARK_ERROR, QUEUE_CLEAR_ERRORS,
} from '../types/tripQueueTypes';
import type { Dispatch } from 'redux';
import type { RootState } from '../store';
import type { TripDraft } from '../../screens/Fisherman/AddTrip/mappers';
import { loadQueueFromStorage, saveQueueToStorage } from '../queuePersistence';

// Hydrate on app start
export const hydrateQueue = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const data = await loadQueueFromStorage();
    if (Array.isArray(data)) {
      dispatch({ type: QUEUE_REPLACE, payload: data });
    }
    await saveQueueToStorage(getState);
  };
};

// Enqueue with job id + timestamp
export const enqueueTrip = (draft: TripDraft) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const job = {
      id: `${draft.tripId}:${Date.now()}`,
      draft,
      status: 'queued' as const,
      createdAt: new Date().toISOString(),
      error: null,
    };
    dispatch({ type: QUEUE_ENQUEUE, payload: job });
    await saveQueueToStorage(getState);
  };
};

export const markUploading = (id: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({ type: QUEUE_MARK_UPLOADING, payload: id });
    await saveQueueToStorage(getState);
  };
};

export const markUploaded = (id: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({ type: QUEUE_MARK_UPLOADED, payload: id });
    await saveQueueToStorage(getState);
  };
};

export const markError = (id: string, error: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({ type: QUEUE_MARK_ERROR, payload: { id, error } });
    await saveQueueToStorage(getState);
  };
};

export const clearErrors = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({ type: QUEUE_CLEAR_ERRORS });
    await saveQueueToStorage(getState);
  };
};
