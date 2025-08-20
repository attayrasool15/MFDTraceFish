// src/services/fisherman.ts

import { api } from "./https";

// Define the fisherman type based on API response
export type Fisherman = {
  id: number;
  name: string;
};

/**
 * Fetch all fishermen list from server
 */
export async function fetchFishermenList(): Promise<Fisherman[]> {
  const res = await api('/fishermen/lists', { method: 'GET' });
  return res.data as Fisherman[];
}
