// src/redux/reducers/authReducer.ts
import {
  AuthAction, AuthState, LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT,
} from '../types';

const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  error: null,
};

export const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return { loading: false, isAuthenticated: true, user: action.payload, error: null };
    case LOGIN_FAILURE:
      return { loading: false, isAuthenticated: false, user: null, error: action.payload };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};
