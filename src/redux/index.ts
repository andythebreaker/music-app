import { combineReducers } from 'redux';

import {
  appReducer,
  songReducer,
  settingsReducer,
  playStateReducer,
  mapReducer,
} from './reducers';

export const reducers = combineReducers({
  app: appReducer,
  songs: songReducer,
  settings: settingsReducer,
  playState: playStateReducer,
  mapState: mapReducer,
});

export * from './actions';
