import {
  QUEUE_REPLACE, QUEUE_ENQUEUE, QUEUE_MARK_UPLOADING, QUEUE_MARK_UPLOADED,
  QUEUE_MARK_ERROR, QUEUE_CLEAR_ERRORS, TripQueueState, TripQueueAction,
} from '../types/tripQueueTypes';

const initial: TripQueueState = { queue: [] };

export const tripQueueReducer = (state = initial, action: TripQueueAction): TripQueueState => {
  switch (action.type) {
    case QUEUE_REPLACE:
      return { ...state, queue: action.payload || [] };

    case QUEUE_ENQUEUE:
      return { ...state, queue: [...state.queue, action.payload] }; // push → tail

    case QUEUE_MARK_UPLOADING:
      return {
        ...state,
        queue: state.queue.map(q => q.id === action.payload ? { ...q, status: 'uploading', error: null } : q),
      };

    case QUEUE_MARK_UPLOADED:
      // Dequeue by id
      return { ...state, queue: state.queue.filter(q => q.id !== action.payload) };

    case QUEUE_MARK_ERROR:
      return {
        ...state,
        queue: state.queue.map(q => q.id === action.payload.id ? { ...q, status: 'error', error: action.payload.error } : q),
      };

    case QUEUE_CLEAR_ERRORS:
      return {
        ...state,
        queue: state.queue.map(q => (q.status === 'error' ? { ...q, status: 'queued', error: null } : q)),
      };

    default:
      return state;
  }
};
