// add at bottom or export with your existing types
export const MARK_TRIP_CLEAN = 'MARK_TRIP_CLEAN' as const;

export type Trip = {
  tripId: string;
  captainName?: string;
  boatNameId?: string;
  departure_port?: string;
  destination_port?: string;
  seaType?: string;
  numCrew?: number;
  numLifejackets?: number;
  emergencyContact?: string;
  seaConditions?: string;
  targetSpecies?: string;
  tripPurpose?: string;
  tripCost?: number;
  fuelCost?: number;
  estimatedCatch?: number;
  equipmentCost?: number;
  gps?: { lat: number; lng: number; accuracy?: number };
  departureAt?: string;
  arrivalAt?: string | null;
  status?: string;
  _dirty?: boolean;         // ← important
  createdAt?: string;       // for sorting locally
};

export const CREATE_TRIP_LOCAL = 'CREATE_TRIP_LOCAL' as const;

export type TripAction =
  | { type: typeof CREATE_TRIP_LOCAL; payload: Trip }
  | { type: typeof MARK_TRIP_CLEAN; payload: { tripId: string } };

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
