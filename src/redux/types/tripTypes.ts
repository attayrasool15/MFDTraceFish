// src/redux/types/tripTypes.ts
export type Trip = {
  tripId: string;
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
  gps: { lat: number; lng: number; accuracy?: number } | null;
  departureAt: string; // ISO
  arrivalAt?: string | null;
  _dirty: boolean;     // pending sync
};

export const CREATE_TRIP_LOCAL = 'CREATE_TRIP_LOCAL' as const;

export type TripAction =
  | { type: typeof CREATE_TRIP_LOCAL; payload: Trip };

// src/redux/types/lotTypes.ts
export type Lot = {
  lotNo: string;
  tripId: string;
  species: string;
  grade: string;
  weightKg: number;
  gps: { lat: number; lng: number; accuracy?: number } | null;
  photoLocalPath?: string;
  capturedAt: string;
  _dirty: boolean;
};

export const CREATE_LOT_LOCAL = 'CREATE_LOT_LOCAL' as const;

export type LotAction =
  | { type: typeof CREATE_LOT_LOCAL; payload: Lot };
