// src/services/users.ts
import { api } from './https';
import { stripUndefined } from '../utils/json';

/** Generic ID type */
export type ID = number | string;

/** Server may paginate like { data, current_page, ... } or just { data } */
export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type UserRole = string;
export type UserType = string;       // if your API distinguishes user_type from role

export type User = {
  id: number;
  name: string;
  email: string;
  role?: UserRole | null;
  user_type?: UserType | null;
  is_verified?: boolean;
  is_active?: boolean;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  [k: string]: any; // allow extra fields from API
};

/** Create / Update bodies (adjust to your backend’s fields) */
export type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  user_type?: UserType;
  phone?: string;
  is_verified?: boolean;
  is_active?: boolean;
};

export type UpdateUserBody = Partial<{
  name: string;
  email: string;
  password: string;
  role: UserRole;
  user_type: UserType;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
}>;

/** Listing params */
export type ListParams = {
  page?: number;
  per_page?: number;
};

/** Search params map to your endpoint:
 * GET /users/search?q=&user_type=&is_verified=&is_active=&date_from=&date_to=&page=&per_page=
 */
export type SearchUsersParams = {
  q?: string;
  user_type?: UserType;
  is_verified?: boolean;
  is_active?: boolean;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  page?: number;
  per_page?: number;
};

/** Some APIs put pagination inside json.data, others at root. Handle both. */
function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

/* =========================================
 * Users (Admin/Super Admin only)
 * ========================================= */

/** 1) Get All Users — GET /users */
export async function listUsers(params?: ListParams) {
  const json = await api('/users', { query: params });
  return unwrap<Paginated<User>>(json);
}

/** 2) Create User — POST /users */
export async function createUser(body: CreateUserBody) {
  const clean = stripUndefined(body);
  const json = await api('/users', { method: 'POST', body: clean });
  return unwrap<User>(json);
}

/** 3) Get User Details — GET /users/{id} */
export async function getUser(id: ID) {
  const json = await api(`/users/${id}`);
  return unwrap<User>(json);
}

/** 4) Update User — PUT /users/{id} */
export async function updateUser(id: ID, body: UpdateUserBody) {
  const clean = stripUndefined(body);
  const json = await api(`/users/${id}`, { method: 'PUT', body: clean });
  return unwrap<User>(json);
}

/** 5) Delete User — DELETE /users/{id} */
export async function deleteUser(id: ID) {
  const json = await api(`/users/${id}`, { method: 'DELETE' });
  return unwrap<{ success: boolean }>(json);
}

/** 6) Verify User — POST /users/{id}/verify */
export async function verifyUser(id: ID) {
  const json = await api(`/users/${id}/verify`, { method: 'POST' });
  return unwrap<User>(json);
}

/** 7) Deactivate User — POST /users/{id}/deactivate */
export async function deactivateUser(id: ID) {
  const json = await api(`/users/${id}/deactivate`, { method: 'POST' });
  return unwrap<User>(json);
}

/** 8) Filter Users by Role — GET /users/filter/role/{role} */
export async function filterUsersByRole(role: UserRole, params?: ListParams) {
  const json = await api(`/users/filter/role/${encodeURIComponent(role)}`, { query: params });
  return unwrap<Paginated<User>>(json);
}

/** 9) Search Users — GET /users/search */
export async function searchUsers(params: SearchUsersParams) {
  const json = await api('/users/search', { query: stripUndefined(params) });
  return unwrap<Paginated<User>>(json);
}
