// src/screens/Fisherman/AddTrip/mappers.ts
import type { CreateTripBody } from '../../../services/trips';

export type TripDraft = {
  tripId: string;
  captainName: string;
  boatNameId: string;
  tripPurpose: string;
  departure_port: string;
  destination_port: string;
  seaType: string;
  numCrew: number;
  numLifejackets: number;
  emergencyContact: string;
  seaConditions: string;
  targetSpecies: string; // from form (now required)
  tripCost: number; // we’ll map to crew_cost by default
  // Optional if you add fields later:
  fuelCost?: number;
  equipmentCost?: number; // <—

  estimatedCatch?: number;
  gps: { lat: number; lng: number; accuracy?: number };
  departureAt: string; // ISO
  arrivalAt: string | null;
  _dirty: boolean;
};

function resolveBoatId(boatNameId: string): number {
  const m = boatNameId.match(/\d+/);
  return m ? Number(m[0]) : 1;
}

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function toCreateTripBody(d: TripDraft): CreateTripBody {
  // Ensure "after today"
  const now = new Date();
  const isoDep = new Date(d.departureAt);
  const todayYmd = toYmd(now);
  let depYmd = toYmd(isoDep);
  if (depYmd <= todayYmd) depYmd = toYmd(addDays(now, 1)); // tomorrow

  const expectedReturnYmd = toYmd(addDays(new Date(depYmd), 1)); // dep+1 day

  // Required numeric fallbacks
  const estimatedCatch =
    typeof d.estimatedCatch === 'number' ? d.estimatedCatch : 0;
  const fuelCost = typeof d.fuelCost === 'number' ? d.fuelCost : 0;
  const crewCost = typeof d.tripCost === 'number' ? d.tripCost : 0;
  const equipmentCost =
    typeof d.equipmentCost === 'number' ? d.equipmentCost : 0; // <—

  return {
    trip_name: d.tripId,
    boat_id: resolveBoatId(d.boatNameId),
    departure_port: d.departure_port,
    destination_port: d.destination_port,
    departure_date: depYmd,
    expected_return_date: expectedReturnYmd, // required

    crew_size: d.numCrew,
    fishing_method: d.tripPurpose || 'Fishing',
    target_species: d.targetSpecies || 'Unspecified', // required
    equipment_cost: equipmentCost, // <— REQUIRED BY BACKEND

    estimated_catch: estimatedCatch, // required
    fuel_cost: fuelCost, // required
    crew_cost: crewCost, // required

    // optional extras
    notes:
      [
        d.captainName ? `Captain: ${d.captainName}` : null,
        d.seaType ? `Sea Type: ${d.seaType}` : null,
        d.seaConditions ? `Sea Conditions: ${d.seaConditions}` : null,
        d.emergencyContact ? `Emergency: ${d.emergencyContact}` : null,
        d.numLifejackets ? `Lifejackets: ${d.numLifejackets}` : null,
        d.gps ? `Start GPS: ${d.gps.lat},${d.gps.lng}` : null,
      ]
        .filter(Boolean)
        .join(' | ') || undefined,
  };
}
