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
import { hexStringToUint8Array, appendDefaultAudio, switch_song, wrapCoordsType, CoordsType } from '../utils';

import {
  ADD_SONGS,
  PLAY_SONG,
  PAUSE_SONG,
  RESUME_SONG,
  DELETE_SONG,
  SET_VIEW,
  SET_MAP,
} from '../redux';

import AudioSession from '../services/audio-session';
import { Track, Menu, Home, NowPlaying, Playlist } from '../views';
import { setTheme } from '../utils';
import './styles.css';
import howhow from '../speech';

/**map */
interface LocationObj_withTimestamp {
  coords: CoordsType; timestamp: Date;
  //coords: GeolocationCoordinates; timestamp: Date;
}
var gps_prv: LocationObj_withTimestamp;
var km = 0.0;
var speech_words = new Array<number>();
const speech_words_all_have_file = (speech_word_STR_array: Array<String>, DB_songs: Array<any>,dispatch_local:Function,SET_MAP_LOACL:any) => {
 //var NG1=1;
  //speech_words = (
    speech_word_STR_array.map((tmp) =>{
     //TODO覆蓋?
     //if (_map!=='init'){
 // const f = new File([hexStringToUint8Array('00') as BlobPart], howhow("這是一隻小豬"));//, { type: 'audio/mpeg' });
 // const dataTransfer = new DataTransfer();
 // dataTransfer.items.add(f);//can do file list
 // dispatch_local(ADD_SONGS(dataTransfer.files));}
    //return DB_songs.findIndex(s => s.name === tmp);}
    //NG1*=(
      if (DB_songs.findIndex(s => s.name === tmp)===-1)dispatch_local(SET_MAP_LOACL('s2'));
      //+1);
    return null;
    }
  );//).reverse();
  //const rt = DB_songs.findIndex(s => s.name === speech_word_STR_array[0]);
  //console.log(rt);
  //return rt;
};
// const storeLocationData = async (//TODO: to src\services\data-store.ts
//   coords: GeolocationCoordinates | undefined,
//   playState_local: { index: number; playing: any; } | undefined,
//   pauseSong_local: Function, resumeSong_local: Function, dispatch_local: Function,
//   songs_local: Array<any>
// ) => {

// };
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

function App() {
  /**map */
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
  /**end of map */

  const prevPlayState = useRef({ playing: false, index: -1 });

  const [ref, size] = useResize();

  const input = useRef(null);
  const audio = useRef(null);
  const dispatch = useDispatch();

  const { view } = useSelector((state: any) => state.app);
  const { _map } = useSelector((state: any) => state.map);
  const songs = useSelector((state: any) => state.songs);
  const settings = useSelector((state: any) => state.settings);
  const playState = useSelector((state: any) => state.playState);

  const [range, setRange] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState('/');//TODO 從這裡改ui不會變

  useMemo(() => setTheme(settings.light), [settings.light]);

  const filteredSongs = useCallback(() => {
    if (!searchText) {
      return appendDefaultAudio(songs);
    } else if (searchText === '/') {
      //**copy */
      const f = new File([hexStringToUint8Array('00') as BlobPart], "這是豬");
      const f2 = { size: 1, name: 'dog', rightIcon: 'box', complex: [3, 2, 1] };
      return [f2, f];
      //**eof */
    } else {
      return appendDefaultAudio(songs.filter((s: any) =>
        s.name.toLowerCase().includes(searchText.toLowerCase()),
      ));
    }
  }, [searchText, songs]);

  const isSongsThere = () => !!songs.length;

  const audioPlayer = (): HTMLAudioElement => audio.current!;

  const play = async () => {//只有最底下UI大顆撥放鈕會觸發
    if (audio.current) {
      try {
        await audioPlayer().play();//同義document.querySelector('#root > div > div > div.app__content > audio').play()
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
        if (songs[index].size <= 1) {
          /**[copy] 就下面一小段 與 新增mp3段落 在 menu.tsx*/
          const htmlAudio: HTMLAudioElement = audioPlayer();
          const f = new File([hexStringToUint8Array(howhow("這是一隻小豬")
          ) as BlobPart], "嘖.mp3");
          htmlAudio.src = URL.createObjectURL(f);
          //TODO ^隨文字撥聲音
          await htmlAudio.play();

          AudioSession.addNewSong(f, {//我猜是系統級多媒體行為
            next: () => nextSong(true),//^與音檔mp3數據無關，是無關啦沒錯
            prev: () => prevSong(true),//^但src\services\audio-session.ts會報錯
            play: () => resumeSong(),//^{type: 'tagFormat', info: 'No suitable tag reader found'}
            pause: () => pauseSong(),//^所以我還是把file送進去
            stop: () => pauseSong(),//^只是不要報錯，但我真的覺得沒差
          });
          /**eof */
        } else {
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
      } else {
        console.log("[index.tsx] 照理來說不應該跳出這個，如果邏輯對的話 @ const start = ...");
      }
    } catch (error) {//!important!這裡是如果音檔無法撥放，總錯會在這裡
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

  const nextSong = (override: boolean = false) => {//自動手動皆會呼叫
    if (isSongsThere()) {
      pauseSong();

      const goNext = (index_of_next_song: number | undefined = undefined) => {
        if (index_of_next_song === undefined) {//母REPO
          dispatch(PLAY_SONG((playState.index + 1) % songs.length));//!imoprtant!學到一招
        } else {
          dispatch(PLAY_SONG(index_of_next_song % songs.length));
        }
      }

      const word_next = () => {
        if (speech_words.length === 0) {//母repo
          goNext();
        } else {
          goNext(speech_words.pop());
        }
      }

      setTimeout(() => {
        if (override) {
          word_next();
          return;
        }

        if (settings.repeat === 'one') {
          resumeSong();
        } else if (settings.repeat === 'all') {
          word_next();
        } else {
          if (playState.index + 1 !== songs.length) {
            word_next();
          }//else: do nothing
        }
      }, 100);//why100?
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
    console.log(JSON.stringify(playState));
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

    /**map*/
    //storeLocationData(coords, playState, pauseSong, resumeSong, dispatch, songs);
    if (!coords) {
      console.log("[index.tsx] Getting the location data&hellip;");
      console.log(coords);
    } else {
      if (isGeolocationAvailable && isGeolocationEnabled) {
        const timestamp = new Date();
        try {
          localForage.getItem<LocationObj_withTimestamp[]>('locationData', (data) => {
            const locationData = data || [];
            const { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy } = wrapCoordsType(coords);
            const locationObj = { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy };
            locationData.push({
              coords: locationObj,
              timestamp,
            });
            localForage.setItem('locationData', locationData, (e, v) => {//TODO V, notuse
              if (e) {
                throw new Error(e);
              }
            });
          });
        } catch (error) {
          console.error('Error storing location data:', error);
        }
        const { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy } = wrapCoordsType(coords);
        km += gps_prv ?
          latitude !== null && longitude !== null && gps_prv.coords.latitude !== null && gps_prv.coords.longitude !== null ?
            calculateDistance(
              gps_prv.coords.latitude,
              gps_prv.coords.longitude,
              latitude,
              longitude
            )
            : 0
          : 0;
        if (km > 10.0 && playState !== undefined) {
          dispatch(SET_MAP('s1'));
          console.log("============================================================");
          //switch_song(SET_speech_words(['達成目標', '一', '公里'], songs,dispatch,_map), playState, pauseSong, resumeSong, dispatch, PLAY_SONG);
        }
        const locationObj = { latitude, longitude, altitude, heading, speed, accuracy, altitudeAccuracy };
        gps_prv = {
          coords: locationObj,
          timestamp: new Date(),
        };
      } else { console.log("isGeolocationAvailable, isGeolocationEnabled one not yes") }
    }
    //-console.log(coords, isGeolocationAvailable, isGeolocationEnabled, km);
    switch (_map) {
      case 'init':
        
        break;
        case 's1':
          const f = new File([hexStringToUint8Array('00') as BlobPart], howhow("達成目標"));//, { type: 'audio/mpeg' });
 const dataTransfer = new DataTransfer();
 dataTransfer.items.add(f);//can do file list
 dispatch(ADD_SONGS(dataTransfer.files));}
        break;
        case 's2':
          speech_words_all_have_file(['達成目標', '一', '公里'], songs,dispatch,SET_MAP);
        break;
    
      default:
        break;
    }

    /**end of map */
    //!important! 這行註解不要動(3小WWW) VVVVVVVV
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playState, coords, isGeolocationAvailable, isGeolocationEnabled , _map]);

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
