// src/redux/reducers/lotsReducer.ts

import { CREATE_LOT_LOCAL, MARK_LOT_CLEAN, LotAction, LotDraft } from '../types/lotTypes';

export type LotsState = { items: LotDraft[] };
const initial: LotsState = { items: [] };

export const lotsReducer = (state = initial, action: LotAction): LotsState => {
  switch (action.type) {
    case CREATE_LOT_LOCAL:
      return { ...state, items: [action.payload, ...state.items] };
    case MARK_LOT_CLEAN:
      return {
        ...state,
        items: state.items.map(l => l.lotId === action.payload.lotId ? { ...l, _dirty: false } : l),
      };
    default:
      return state;
  }
};
