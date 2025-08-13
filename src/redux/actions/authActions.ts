import { Dispatch } from 'redux';
import * as Keychain from 'react-native-keychain';
import { api, setAccessToken } from '../../services/api';
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  AUTH_REHYDRATED, AuthUser
} from '../types/authTypes';

export const rehydrateAuth = () => async (dispatch: Dispatch) => {
  try {
    const creds = await Keychain.getGenericPassword({ service: 'mfdtracefish.auth' });
    if (creds) {
      const parsed = JSON.parse(creds.password);
      setAccessToken(parsed.accessToken);
      dispatch({ type: AUTH_REHYDRATED, payload: { accessToken: parsed.accessToken, user: parsed.user } });
      return;
    }
  } catch {}
  dispatch({ type: AUTH_REHYDRATED, payload: null });
};

export const login = (email: string, password: string) => async (dispatch: Dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    // Laravel default could be /login or /auth/login depending on your routes
    const { data } = await api.post('/auth/login', { email, password });
    // Expected response: { accessToken, user: { id, name, email, role } }
    const { accessToken, user } = data as { accessToken: string; user: AuthUser };

    setAccessToken(accessToken);

    await Keychain.setGenericPassword('auth', JSON.stringify({ accessToken, user }), {
      service: 'mfdtracefish.auth',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });

    dispatch({ type: LOGIN_SUCCESS, payload: { accessToken, user } });
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Login failed';
    dispatch({ type: LOGIN_FAILURE, error: msg });
  }
};

export const register = (payload: { name: string; email: string; password: string; role?: string }) => async (dispatch: Dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    // Adjust to your Laravel route (e.g., /auth/register)
    const { data } = await api.post('/auth/register', payload);
    // Option A: server logs user in immediately
    const { accessToken, user } = data as { accessToken?: string; user: AuthUser };

    if (accessToken) {
      setAccessToken(accessToken);
      await Keychain.setGenericPassword('auth', JSON.stringify({ accessToken, user }), {
        service: 'mfdtracefish.auth',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
      dispatch({ type: REGISTER_SUCCESS, payload: { accessToken, user } });
    } else {
      // Option B: require manual login after registration
      dispatch({ type: REGISTER_SUCCESS, payload: { accessToken: null, user } });
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Registration failed';
    dispatch({ type: REGISTER_FAILURE, error: msg });
  }
};

export const logout = () => async (dispatch: Dispatch) => {
  try {
    await Keychain.resetGenericPassword({ service: 'mfdtracefish.auth' });
  } catch {}
  setAccessToken(null);
  dispatch({ type: LOGOUT });
};