import { useEffect, useState } from 'react';

const useDuration = (songs: any[]) => {
  const [duration, setDuration] = useState<any>({});

  useEffect(() => {
    (async () => {
      let data: any = {};
      const durationPromises = songs.map(song => {
        if (song.size <= 1) {//TODO check if is ok mp3 file, not just use size
          return new Promise<any>(resolve => { resolve(-1) });
        } else {
          const audio = document.createElement('audio');
          audio.src = URL.createObjectURL(song);

          return new Promise<any>(resolve => {
            audio.addEventListener(
              'loadedmetadata',
              function () {
                resolve({ [song.name]: audio.duration });
              },
              false,
            );
          });
        }
      });

      const durations = await Promise.all(durationPromises);

      durations.forEach(d => {
        console.log(d);
        data = { ...data, ...d };
      });

      setDuration(() => data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs]);

  return duration;
};

export default useDuration;
