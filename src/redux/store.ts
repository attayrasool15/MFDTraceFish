// src/redux/store.ts
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk'; // <-- use named export

import { authReducer } from './reducers/authReducer';
import { tripsReducer } from './reducers/tripReducer';
import { lotsReducer } from './reducers/lotReducer';
import { tripQueueReducer } from './reducers/tripQueueReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  trips: tripsReducer,
  lots: lotsReducer,
  tripQueue: tripQueueReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// If you don't care about DevTools for now, keep it super simple:
const enhancer = applyMiddleware(thunkMiddleware);
const composeEnhancers =
  ((global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose) ||
  compose;
export const store = createStore(rootReducer, composeEnhancers(enhancer));
