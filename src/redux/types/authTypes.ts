export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST' as const;
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS' as const;
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE' as const;
export const LOGOUT = 'auth/LOGOUT' as const;
export const REGISTER_REQUEST = 'auth/REGISTER_REQUEST' as const;
export const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS' as const;
export const REGISTER_FAILURE = 'auth/REGISTER_FAILURE' as const;
export const AUTH_REHYDRATED = 'auth/AUTH_REHYDRATED' as const;

export type UserRole = 'FISHERMAN' | 'AUCTIONEER' | 'EXPORTER' | 'MFD';

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  role: UserRole;
}

export interface AuthState {
  status: 'checking' | 'unauthenticated' | 'authenticated';
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  error?: string | null;
}