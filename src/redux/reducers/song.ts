import { T_ADD_SONGS, T_REMOVE_SONGS } from '../types';

export const songReducer = (state = [], action: any) => {
  switch (action.type) {
    case T_ADD_SONGS: {
      return [...state, ...action.songs].filter(//state=file_list_prev, action.songs=HTML_FILE_LIST_object
        (song, index, self) => {//index=0,1,2,3...~end,song=list[index], self=list
          return self.findIndex(s => s.name === song.name) === index;//true*x, where x is runtimes number, x===list.length
        },
      );
    }
    case T_REMOVE_SONGS: {
      return state.filter((_, index) => index !== action.index);
    }
    default: {
      return state;
    }
  }
};
