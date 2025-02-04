export const setTheme = (light: boolean = false) => {
  const darkTheme: any = {
    '--padding': '24px',

    '--bg-color': '#191b2d',
    '--bg-color-accent': '#35395f',
    '--bg-color-accent-2': '#20233a',
    '--bg-color-secondary': '#4a5085',

    '--color-primary': 'rgba(255, 255, 255, 1)',
    '--color-secondary': 'rgba(255, 255, 255, 0.78)',
    '--color-disabled': 'rgba(255, 255, 255, 0.46)',
    '--color-dim': 'rgba(255, 255, 255, 0.06)',
  };
  const lightTheme: any = {
    '--padding': '24px',

    '--bg-color': '#edeef5',
    '--bg-color-accent': '#bbbed9',
    '--bg-color-accent-2': '#d4d6e7',
    '--bg-color-secondary': '#c7cae0',

    '--color-primary': 'rgba(0, 0, 0, 1)',
    '--color-secondary': 'rgba(0, 0, 0, 0.86)',
    '--color-disabled': 'rgba(0, 0, 0, 0.56)',
    '--color-dim': 'rgba(53, 57, 95, 0.06)',
  };

  const themeObject = light ? lightTheme : darkTheme;

  const root = document.querySelector(':root');
  const themeVariables = Object.keys(themeObject);

  if (root && themeObject) {
    themeVariables.forEach(themeVar => {
      const varValue = themeObject[themeVar];
      if (varValue && themeVar.startsWith('--')) {
        (root as any).style.setProperty(themeVar, String(varValue));
      }
    });
  }
};

export const songTitle = (song: any) => {
  let title = 'No title';
  if (song && song.name) {
    title = song.name;
  }

  return title.split('.')[0];
};

export const getTime = (time: number) => {
  return time ? new Date(time * 1000).toISOString().substr(14, 5) : '';
};

export function hexStringToUint8Array(hexString: string): Uint8Array {//TODO TO util
  const length = hexString.length;
  const uint8Array = new Uint8Array(length / 2);

  for (let i = 0; i < length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    uint8Array[i / 2] = byteValue;
  }

  return uint8Array;
}

export function appendDefaultAudio(song_in: Array<any>): Array<any> {
  return song_in = [song_in.find(s => s.name === '公里') === undefined && { size: 1, name: '公里', rightIcon: 'box', complex: [3, 2, 1] }, ...song_in];
}

export function switch_song(idx: number, playState_local: { index: number; playing: any; }, pauseSong_local: Function, resumeSong_local: Function, dispatch_local: Function, PLAY_SONG_local: Function) {
  idx === playState_local.index
    ? playState_local.playing
      ? pauseSong_local()
      : resumeSong_local()
    : dispatch_local(PLAY_SONG_local(idx));
}

export interface CoordsType {
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
}

export function wrapCoordsType(tmp: any): CoordsType {
  return {
    accuracy: tmp.accuracy !== undefined ? tmp.accuracy : null,
    altitude: tmp.altitude !== undefined ? tmp.altitude : null,
    altitudeAccuracy: tmp.altitudeAccuracy !== undefined ? tmp.altitudeAccuracy : null,
    heading: tmp.heading !== undefined ? tmp.heading : null,
    latitude: tmp.latitude !== undefined ? tmp.latitude : null,
    longitude: tmp.longitude !== undefined ? tmp.longitude : null,
    speed: tmp.speed !== undefined ? tmp.speed : null,
  };
}
