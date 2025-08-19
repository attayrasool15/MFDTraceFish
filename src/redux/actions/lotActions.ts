
import { CREATE_LOT_LOCAL, MARK_LOT_CLEAN, LotDraft, LotAction } from '../types/lotTypes';

export const createLotLocal = (lot: LotDraft): LotAction => ({ type: CREATE_LOT_LOCAL, payload: lot });
export const markLotClean = (lotId: string): LotAction => ({ type: MARK_LOT_CLEAN, payload: { lotId } });
