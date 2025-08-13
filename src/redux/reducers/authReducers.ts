import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  AUTH_REHYDRATED, AuthState
} from '../types/authTypes';

const initialState: AuthState = {
  status: 'checking',
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action: any): AuthState {
  switch (action.type) {
    case AUTH_REHYDRATED: {
      const payload = action.payload;
      if (payload?.accessToken && payload?.user) {
        return { ...state, status: 'authenticated', accessToken: payload.accessToken, user: payload.user, loading: false, error: null };
      }
      return { ...state, status: 'unauthenticated', accessToken: null, user: null, loading: false, error: null };
    }

    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return { ...state, loading: false, status: action.payload?.accessToken ? 'authenticated' : state.status, accessToken: action.payload?.accessToken ?? state.accessToken, user: action.payload?.user ?? state.user, error: null };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return { ...state, loading: false, error: action.error };

    case LOGOUT:
      return { ...state, status: 'unauthenticated', accessToken: null, user: null, loading: false, error: null };

    default:
      return state;
  }
}