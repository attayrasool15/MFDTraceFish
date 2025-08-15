// src/redux/types.ts
import type { UserRole } from '../constants/dummyUsers';

export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: null | { email: string; name: string; role: UserRole };
  error: string | null;
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST' as const;
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS' as const;
export const LOGIN_FAILURE = 'LOGIN_FAILURE' as const;
export const LOGOUT = 'LOGOUT' as const;

export type AuthAction =
  | { type: typeof LOGIN_REQUEST }
  | { type: typeof LOGIN_SUCCESS; payload: { email: string; name: string; role: UserRole } }
  | { type: typeof LOGIN_FAILURE; payload: string }
  | { type: typeof LOGOUT };
