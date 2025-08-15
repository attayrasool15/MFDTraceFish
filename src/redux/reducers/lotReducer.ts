// src/redux/reducers/lotsReducer.ts
import { Lot, LotAction, CREATE_LOT_LOCAL } from '../types/tripTypes';

export type LotsState = {
  items: Lot[];
};

const initial: LotsState = { items: [] };

export const lotsReducer = (state = initial, action: LotAction): LotsState => {
  switch (action.type) {
    case CREATE_LOT_LOCAL:
      return { ...state, items: [action.payload, ...state.items] };
    default:
      return state;
  }
};
