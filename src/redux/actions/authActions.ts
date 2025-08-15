// src/redux/actions/authActions.ts
import { DUMMY_USERS } from '../../constants/dummyUsers';
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, AuthAction,
} from '../types';

export const login = (email: string, password: string): AuthAction[] => {
  // Classic Redux without thunk: return a *batch* we’ll dispatch one by one in the screen
  const actions: AuthAction[] = [{ type: LOGIN_REQUEST }];

  const found = DUMMY_USERS.find(u => u.email === email && u.password === password);
  if (found) {
    actions.push({
      type: LOGIN_SUCCESS,
      payload: { email: found.email, name: found.name, role: found.role },
    });
  } else {
    actions.push({ type: LOGIN_FAILURE, payload: 'Invalid email or password' });
  }
  return actions;
};

export const logout = (): AuthAction => ({ type: LOGOUT });
