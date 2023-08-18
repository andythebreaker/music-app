import { T_SET_MAP } from '../types';

export const mapReducer = (
  state = {
    audio_state: 'init',
  },
  action: any,
) => {
  switch (action.type) {
    case T_SET_MAP:
      return { ...state, audio_state: action.value };
    default: {
      return state;
    }
  }
};
