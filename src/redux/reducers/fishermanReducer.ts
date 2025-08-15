// src/redux/reducers/fishermanReducer.ts
export type Trip = {
  id: string;              // TRIP-YYYYMMDD-HHMMSS-xxxxx
  captainName: string;
  boatNameId: string;
  tripPurpose: string;
  port: string;
  seaType: string;
  numCrew: number;
  numLifejackets: number;
  emergencyContact: string;
  seaConditions: string;
  targetSpecies: string;
  tripCost: number;
  gps: { lat: number; lng: number; accuracy?: number };
  departureAt: string;     // ISO
  arrivalAt?: string | null;
  _dirty: boolean;         // needs sync
};

export type Lot = {
  id: string;              // ulid()
  lotNo: string;           // LOT-YYYYMMDD-HHMM-<lat>-<lng>
  tripId: string;          // FK to Trip.id
  species: string;
  grade: string;
  weightKg: number;
  capturedAt: string;      // ISO
  gps: { lat: number; lng: number; accuracy?: number };
  photoLocalPath?: string;
  _dirty: boolean;         // needs sync
};

// Action types
export const TRIP_ADD_LOCAL = 'TRIP_ADD_LOCAL' as const;
export const LOT_ADD_LOCAL  = 'LOT_ADD_LOCAL'  as const;

// Actions
export type FishermanAction =
  | { type: typeof TRIP_ADD_LOCAL; payload: Trip }
  | { type: typeof LOT_ADD_LOCAL;  payload: Lot };

export type FishermanState = {
  trips: Trip[];
  lots: Lot[];
};

const initialState: FishermanState = {
  trips: [],
  lots: [],
};

export function fishermanReducer(
  state = initialState,
  action: FishermanAction
): FishermanState {
  switch (action.type) {
    case TRIP_ADD_LOCAL:
      return { ...state, trips: [action.payload, ...state.trips] };
    case LOT_ADD_LOCAL:
      return { ...state, lots: [action.payload, ...state.lots] };
    default:
      return state;
  }
}
