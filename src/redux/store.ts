// src/redux/store.ts
import { createStore, combineReducers } from 'redux';
import { authReducer } from './reducers/authReducer';
import { tripsReducer } from './reducers/tripReducer';
import { lotsReducer } from './reducers/lotReducer';


const rootReducer = combineReducers({
  auth: authReducer,
  trips: tripsReducer,
  lots: lotsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export const store = createStore(rootReducer);
