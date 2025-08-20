export const CREATE_LOT_LOCAL = 'CREATE_LOT_LOCAL' as const;
export const MARK_LOT_CLEAN = 'MARK_LOT_CLEAN' as const;

export type LotDraft = {
  lotId: string;          // local unique id
  tripId: string;         // local tripId (links to the trip)
  species: string;
  weightKg: number;
  grade?: string;
  pricePerKg?: number;
  createdAt: string;
  _dirty: boolean;
};

export type LotAction =
  | { type: typeof CREATE_LOT_LOCAL; payload: LotDraft }
  | { type: typeof MARK_LOT_CLEAN; payload: { lotId: string } };
