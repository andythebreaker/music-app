import './styles.css';
import { FaAd, FaPause, FaPlay, FaTrash } from 'react-icons/fa';

import { useDuration } from '../../hooks';
import { getTime } from '../../utils';

type PlaylistProps = {
  songs: any[];
  filteredSongs: any[];
  grid?: boolean;
  playState?: any;
  onClick?: Function;
  onDelete?: Function;
};

const Playlist = ({
  songs,
  onClick,
  onDelete,
  grid = false,
  filteredSongs,
  playState = {},
}: PlaylistProps) => {
  const { index, playing } = playState;

  const duration = useDuration(songs);

  const getDuration = (name: string) => {
    return duration[name] ? getTime(duration[name]) : '';//TODO 新增音檔未到提示字
  };

  const isSelected = (name: string) => {
    if (!songs[index]) {
      return false;
    }
    return songs[index].name.toLowerCase() === name.toLowerCase();
  };

  const getIndex = (name: string) => {
    return songs.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <div
      className={`playlist ${grid ? 'playlist--grid' : ''} ${index > -1 ? 'playlist--bottom-padded' : ''
        }`.trim()}
    >
      {filteredSongs.map(({ name, rightIcon }: any, i: number) => (
        <div
          key={i}
          className={`playlist__item ${isSelected(name) ? 'playlist__item--selected' : ''
            }`}
        >
          {grid && (
            <>
              <div title={name} className="playlist__name">
                {name}
              </div>
              <div className="playlist__duration">{getDuration(name)}</div>
            </>
          )}
          <div
            className="playlist__icon"
            onClick={() => onClick && onClick(getIndex(name))}
          >
            {isSelected(name) && playing ? (
              <FaPause size={18} />
            ) : (
              <FaPlay size={18} />
            )}
          </div>
          {!grid && (
            <>
              <div title={name} className="playlist__name">
                {name}
              </div>
              <div style={{ flexGrow: 1 }}></div>
              <div className="playlist__duration">{getDuration(name)}</div>
            </>
          )}
          <div
            className="playlist__icon playlist__icon--right"
            onClick={() => onDelete && onDelete(getIndex(name))}
          >
            {rightIcon === undefined ? (
              <FaTrash size={18} />
            ) : (
              <FaAd size={18} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Playlist;
