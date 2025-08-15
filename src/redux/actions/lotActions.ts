// src/redux/actions/lotActions.ts

import { CREATE_LOT_LOCAL, Lot, LotAction } from "../types/tripTypes";

export const createLotLocal = (lot: Lot): LotAction => ({
  type: CREATE_LOT_LOCAL,
  payload: lot,
});
