import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronLeft } from 'react-icons/fa';
/**map */
import { useGeolocated } from "react-geolocated";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import localForage from 'localforage';
import calculateDistance from 'gps-distance';//Vlad Ganshin@https://stackoverflow.com/questions/42964013/adding-declarations-file-manually-typescript

import { Header, Empty } from '../components';
import { useResize } from '../hooks';

import {
  ADD_SONGS,
  PLAY_SONG,
  PAUSE_SONG,
  RESUME_SONG,
  DELETE_SONG,
  SET_VIEW,
} from '../redux';

import AudioSession from '../services/audio-session';
import { Track, Menu, Home, NowPlaying, Playlist } from '../views';
import { setTheme } from '../utils';
import './styles.css';

/**map */
interface LocationObj_withTimestamp {
  coords: GeolocationCoordinates; timestamp: Date;
}
var gps_prv: LocationObj_withTimestamp;
var km = 0.0;
const storeLocationData = async (coords: GeolocationCoordinates | undefined,
  playState_local: { index: number; playing: any; } | undefined,
  pauseSong_local: Function, resumeSong_local: Function, dispatch_local: Function
) => {
  if (coords === undefined) {
    console.log("GPS no good :: [index.tsx] coords is undefined !");
  } else {
    const timestamp = new Date();
    try {
      const data = await localForage.getItem<LocationObj_withTimestamp[]>('locationData');
      const locationData = data || [];
      const { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy } = coords;
      const locationObj = { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy };
      locationData.push({
        coords: locationObj,
        timestamp,
      });
      await localForage.setItem('locationData', locationData);
    } catch (error) {
      console.error('Error storing location data:', error);
    }

    const { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy } = coords;
    km += gps_prv
      ? calculateDistance(
        gps_prv.coords.latitude,
        gps_prv.coords.longitude,
        latitude,
        longitude
      )
      : 0;
    if (km > 10.0 && playState_local !== undefined) {
      1 === playState_local.index
        ? playState_local.playing
          ? pauseSong_local()
          : resumeSong_local()
        : dispatch_local(PLAY_SONG(1));
    }
    const locationObj = { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy };
    gps_prv = {
      coords: locationObj,
      timestamp: new Date(),
    };
  }
};

function App() {
  const prevPlayState = useRef({ playing: false, index: -1 });

  const [ref, size] = useResize();

  const input = useRef(null);
  const audio = useRef(null);
  const dispatch = useDispatch();

  const { view } = useSelector((state: any) => state.app);
  const songs = useSelector((state: any) => state.songs);
  const settings = useSelector((state: any) => state.settings);
  const playState = useSelector((state: any) => state.playState);

  const [range, setRange] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState('');

  useMemo(() => setTheme(settings.light), [settings.light]);

  const filteredSongs = useCallback(() => {
    if (!searchText) {
      return songs;
    } else {
      return songs.filter((s: any) =>
        s.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
  }, [searchText, songs]);

  const isSongsThere = () => !!songs.length;

  const audioPlayer = (): HTMLAudioElement => audio.current!;

  const play = async () => {
    if (audio.current) {
      try {
        await audioPlayer().play();
      } catch (error) {
        console.trace(error);
      }
    }
  };

  const pause = () => {
    if (audio.current) {
      audioPlayer().pause();
    }
  };

  const start = async (index: number) => {
    try {
      if (audio.current && songs[index]) {
        const htmlAudio: HTMLAudioElement = audioPlayer();
        htmlAudio.src = URL.createObjectURL(songs[index]);

        await htmlAudio.play();

        AudioSession.addNewSong(songs[index], {
          next: () => nextSong(true),
          prev: () => prevSong(true),
          play: () => resumeSong(),
          pause: () => pauseSong(),
          stop: () => pauseSong(),
        });
      }
    } catch (error) {
      dispatch(PLAY_SONG(0));
    }
  };

  const stop = () => {
    const htmlAudio: HTMLAudioElement = audioPlayer();
    htmlAudio.src = '';
  };

  const shuffleSong = () => {
    if (isSongsThere()) {
      dispatch(PLAY_SONG(Math.floor(Math.random() * songs.length)));
    }
  };

  const nextSong = (override: boolean = false) => {
    if (isSongsThere()) {
      pauseSong();

      const goNext = () =>
        dispatch(PLAY_SONG((playState.index + 1) % songs.length));

      setTimeout(() => {
        if (override) {
          goNext();
          return;
        }

        if (settings.repeat === 'one') {
          resumeSong();
        } else if (settings.repeat === 'all') {
          goNext();
        } else {
          if (playState.index + 1 !== songs.length) {
            goNext();
          }
        }
      }, 100);
    }
  };

  const prevSong = (override: boolean = false) => {
    if (isSongsThere()) {
      pauseSong();

      setTimeout(() => {
        if (settings.repeat === 'one' && !override) {
          resumeSong();
        } else {
          const prevIndex = playState.index - 1;
          const index = prevIndex < 0 ? songs.length - 1 : prevIndex;
          dispatch(PLAY_SONG(index));
        }
      }, 100);
    }
  };

  const pauseSong = () => {
    if (isSongsThere()) {
      dispatch(PAUSE_SONG());
    }
  };

  const resumeSong = () => {
    if (isSongsThere()) {
      dispatch(RESUME_SONG());
    }
  };

  const handleSongEnd = () => {
    if (isSongsThere()) {
      nextSong();
    }
  };

  const deleteSong = (index: number) => {
    if (index === playState.index) {
      dispatch(PLAY_SONG(-2));
    }

    setTimeout(() => {
      dispatch(DELETE_SONG(index));
    }, 100);
  };

  useEffect(() => {
    if (
      JSON.stringify(prevPlayState.current) !== JSON.stringify(playState) &&
      isSongsThere()
    ) {
      const { playing, index } = playState;
      const { index: prevIndex } = prevPlayState.current;

      if (!playing) {
        pause();
      } else if (index === -1) {
        dispatch(PLAY_SONG(0));
      } else if (index === prevIndex) {
        play();
      } else if (index === -2) {
        stop();
      } else {
        start(index);
      }
    }

    prevPlayState.current = playState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playState]);

  const updateTime = () => {
    const currentTime =
      (100 * audioPlayer().currentTime) / audioPlayer().duration || 0;

    setRange(Math.round(currentTime));
  };
  // eslint-disable-next-line
  const timeDrag = (time: number) => {
    const range = audioPlayer().duration * (time / 100);
    if (!isNaN(range)) {
      audioPlayer().currentTime = range;
    }
  };

  const addSongs = () => {
    if (input.current) {
      const filePicker: HTMLInputElement = input.current!;
      filePicker.click();
    }
  };

  /**map */
  const customIcon = L.icon({
    iconUrl: `${process.env.PUBLIC_URL}/logo192.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: `${process.env.PUBLIC_URL}/logo192.png`,
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: Infinity,
      },
      userDecisionTimeout: 5000,
      watchPosition: true,
      suppressLocationOnMount: false,
      isOptimisticGeolocationEnabled: true,
    });
  storeLocationData(coords,playState,pauseSong,resumeSong,dispatch);

  return (
    <div ref={ref} className="app__wrapper">
      <div className="app__container">
        {
          view === 'map' ? (
            <Header
              title="map"
              onRightIconClick={() => addSongs()}
              onLeftIconClick={() => setShowMenu(!showMenu)}
            />
          ) : view === 'home' ? (
            <Header
              title="playlist"
              onRightIconClick={() => addSongs()}
              onLeftIconClick={() => setShowMenu(!showMenu)}
            />
          ) : (
            <Header
              title="Track"
              rightIcon={null}
              leftIcon={
                <div style={{ transform: 'translateX(-2px)' }}>
                  <FaChevronLeft size={24} />
                </div>
              }
              onLeftIconClick={() => dispatch(SET_VIEW('home'))}
            />
          )
        }

        <Menu show={showMenu} onClose={() => setShowMenu(false)} />

        {view === 'home' && (
          <Home
            showSearch={true}
            onSearch={(e: string) => setSearchText(e)}
            playlist={
              filteredSongs().length === 0 ? (
                <Empty
                  message="No songs found"
                  description={
                    searchText && songs.length > 0
                      ? 'To widen your search, change or remove keyword'
                      : 'When you are ready, go ahead and add few songs'
                  }
                />
              ) : (
                <Playlist
                  songs={songs}
                  grid={settings.grid}
                  playState={playState}
                  filteredSongs={filteredSongs()}
                  onDelete={(index: number) => deleteSong(index)}
                  onClick={(index: number) =>
                    index === playState.index
                      ? playState.playing
                        ? pauseSong()
                        : resumeSong()
                      : dispatch(PLAY_SONG(index))
                  }
                />
              )
            }
          />
        )}
        {view === 'track' && (
          <Track
            size={size}
            range={range}
            audio={audioPlayer()}
            playing={playState.playing}
            onPlay={() => resumeSong()}
            onPause={() => pauseSong()}
            onNext={() => nextSong(true)}
            onPrev={() => prevSong(true)}
            onShuffle={() => shuffleSong()}
            song={songs[playState.index]}
            onChange={(v: number) => timeDrag(v)}
          />
        )}
        {view === 'map' && (isGeolocationAvailable === false ? (
          <h2>Your browser does not support Geolocation</h2>
        ) : isGeolocationEnabled === false ? (
          <h2>Geolocation is not enabled</h2>
        ) : (//TODO [(coords)?coords.latitude:0.0, (coords)?coords.longitude:0.0] 好麻煩喔
          <MapContainer style={{ width: "100vw", height: "100vh" }} center={[(coords) ? coords.latitude : 0.0, (coords) ? coords.longitude : 0.0]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[(coords) ? coords.latitude : 0.0, (coords) ? coords.longitude : 0.0]} icon={customIcon}>
              <Popup>
                km <br /> {km}
              </Popup>
            </Marker>
          </MapContainer>
        ))}

        <div className="app__content">
          <input
            hidden
            multiple
            type="file"
            ref={input}
            accept="audio/mp3,audio/wav,audio/ogg"
            onChange={e => dispatch(ADD_SONGS(e.target.files))}
          />
          <audio
            hidden
            controls
            ref={audio}
            onEnded={() => handleSongEnd()}
            onTimeUpdate={() => updateTime()}
          ></audio>
        </div>
        <NowPlaying
          size={size}
          percent={range}
          width={size.width}
          audio={audioPlayer()}
          playing={playState.playing}
          song={songs[playState.index]}
          onPlay={() => resumeSong()}
          onPause={() => pauseSong()}
          onClick={() => dispatch(SET_VIEW('track'))}
          open={view === 'home' && playState.index > -1}
        />
      </div>
    </div>
  );
}

export default App;
