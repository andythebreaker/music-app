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
import { hexStringToUint8Array } from '../utils';

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
const speech_words = new Array<number>();
speech_words.push(3);speech_words.push(1);speech_words.push(2);//TODO 需要反向
const storeLocationData = async (//TODO: to src\services\data-store.ts
  coords: GeolocationCoordinates | undefined,
  playState_local: { index: number; playing: any; } | undefined,
  pauseSong_local: Function, resumeSong_local: Function, dispatch_local: Function
) => {
  if (coords === undefined) {
    console.log("[index.tsx] Getting the location data&hellip;");
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
      /**[COPY] switch song*/
      1 === playState_local.index
        ? playState_local.playing
          ? pauseSong_local()
          : resumeSong_local()
        : dispatch_local(PLAY_SONG(1));
      /**eof */
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
          const f = new File([hexStringToUint8Array('4944330400000000010a54585858000000120000036d616a6f725f6272616e640069736f6d0054585858000000130000036d696e6f725f76657273696f6e00353132005458585800000024000003636f6d70617469626c655f6272616e64730069736f6d69736f32617663316d70343100545353450000000f0000034c61766635382e32392e3130300000000000000000000000fffb50000000000000000000000000000000000000000000000000000000000000000000496e666f0000000f0000000d00001609001c1c1c1c1c1c1c2f2f2f2f2f2f2f2f42424242424242425555555555555568686868686868687b7b7b7b7b7b7b7b8e8e8e8e8e8e8ea1a1a1a1a1a1a1a1b4b4b4b4b4b4b4b4c7c7c7c7c7c7c7dadadadadadadadaededededededededffffffffffffff000000004c61766335382e353400000000000000000000000024064b000000000000160992ac8d2200000000000000000000000000000000fffb90640000034a4e368519400036a27581a7bc00518d7b6bb8f68010eb9ee9f71e7002d688726030b2806174620e4c9da9e79e7bf3279ee60f092403c1e121182d814c2fc6000701b1b900881103c6231103c63cf430c98618ca3f1164e400de2db900f0927bfa9e7ba0fcfa19ffa6637fffa7f9efff469e79e83f27710020b041c7fc1038082c3f4ce17787e007ed8721d0c23ec3562c6c417e0e713338d1017806418848c000002024877885839c43cf33701ce2668f521383a1c21b3ab1e683cf1038fe7ec67bafc7c3e03a1d8e875fa185d3112f380e06013562d5d90431f33e00fe25e5aab4006e133042ce26ec860db00dc0768021d05cdeece04d01d84a0e87d05b2990adcde5f1de2664c0570b1ed6ffa478dc7b872c60d9ea76ffc72170f0f045c975215feaffe81d372e170d33027143feffffe664a8c394c971de3064b85402e039c719f321e9da207a471a81174c502b16000002d0000bf242175f3bb8e04756dfb83f7cf8485b04e677ffd5f4317efeffffffffffffffd0cb78f88c24048dfffffffff5aa85acd869100156b9b9d8fd77d66a55448900e297cdfffb92640a80743f6157ef616002368189beec3c000ed1635567b04fc8d985e4019d64c8f87fa8a3bdbd403a0521e49c8b0b8f9a9a2d26af93f528a8686a62a1af6c383dca341f0b8f20a9a18cb55b391c4a29e6ec2a59abd5cc74f73dec74f6db88ba65b2e2a4efe84271ffe73964dc3f7553d9f349fceb54ffffcf4eaabf864d444bead5855e7e61edcd0fc3972db75be13aa48670ba0000200001200001877b593b5772d25f81d4340cee78433a96355bac396a4992a4d659f7f88af229fffffffca87517ffffffff889ed2493485400035b07f0fb344d63b532705ca41705713c4822a22a90c86e99faec70c2ab4b75392f397387138e8767cac0728722401eb2a73121992c8a31a97be74563b8dd6d6c4faa8d9b38b72d6dfc0615cc1adf5b193fbab215a4f6a33368d75222a3f6a17fa5cbaba7b44f7ed28e49d3c9dfb42abcac8c8a158c6856205421454e20821d02c01e498694013148f09e4a740c2c9cd78a1f25183968890fb147b3bfffffffe788ffffffffeb1a32a61080b201f856274a214f44a84bc94e18c75aed4e72120524e5be1be67ed9ad4ac0ea3c08fba23fffb92641383f4775f5421e94680304198506f9b2552bd935287a47b40bf86a181be65151d72f9b596f695196c48659a71b8d2dc89551716fba1046d8155a3a2bd85524fbc6ac7a4d9088f36f087cc1a3e443138f141faba424b0761732cbaee69f9959be6c68c498aaab7820d993d6e7c60a3c0c59e2fa92038135da7fdc183d083b99aba897629db00a83183fd00884b443ce6623615279c881e652159a25e814fe9ca48e67e7a3ef8ae48440cde50f9965bb227a332d752f8be13428204b010a1d273274a03d54a841c64e4f4d2299db9a191daa15acd6c4282cb169062c27ccccebb54b6379717a8e532e9bdeda20f998972215b32055a42d17a57609288dbf5b5b96b25da8b1dcd2aced4a6c545ab333b264bcbfe91b688a8609ae32560b6b9c2ab56eae0431388ae3d35bc628a75042b4ebd226e23ab2acca4d25fda7321eaefa4a79136fd13550f28a26ff6e418eafbb40407a6e3f46b8746350a03e4008d1b125989fb86cd158a87ca168d81ca02a38c6e1b121478a61a37180e085d8eb192c650006b384ee2e24b5c53a385704b0b339d22aeed3056dc9751f65e0cdb5afffb92641003f3f362d3c1e91c703421a8406f9b4150114d4907a47a88c98a2201bc8990d9bf0c2aa20e88d6364c3e589945e82418604809996ed031da86c6ae11f70aa40bdd7af1512d58afd5a0f95b422913b0f41bf042d56b054b1b9763605adb47233ad48dbcaae317e2b811df23e34d4535e3feebfced7333ca211fee0e166514d4b1a0a179ef688a149829e9fb119a6231d1851b6aca69307957fcce025ff41198d9f1e3ab028415b8a81a605926680f0c57d0fc0d4414a61846441c843424c9017e398f832914efc96502e6f02248cd47db79583462f11ba955128deaece52e11ded9ad796d6152589c2bb4244f2ecf8bf612aeae3d6433633cb2e9092a2092b293f259c43ec923b5e20fe0dc4aa917e0c241553a43d1ab5b1fffa50bf8591979446a9a905204c6a7f71cb786b434a3fa0b8f56fedd4fd34d6c47b30881074e1988a982831ead71af8b993a6b84fe95090a92750a85301bfc742824041d971c0dc3b93d8e2c8a03800004cf19d12942cb464923616cd266949fadbb5da7b27e35199d161a70d16d5f6db6a057c8d7d1a8b5398ac2bc1531584b120b698b24fffb92641c0283e83751b30c1b72300288d0674d4a0f596d40ac306dc0b789a69cf6155091d47460f756b4f17a9b31415137b428501ffe8604383215d28c40478d1cda2e66768a08c9d19de3310a20a7adf6c7a8b9dfc4db6e9b5f9ac1bcb143313fbb7f699b53c9a095dfce64d0660c046a0ae0ec18d36c3d21770c3a11617519e8291008540962200d00bf7986142a69c78da1f430af0b3704018924a17bdf349e4ba4a52824a93bde3795c98ac1486060c922c128faeb9f44fde15cb58387cba8ced37ad3f1ba3425948c84532b18174463a5d5b9a2f2fe4187b0cf870c2c522e59e916d75741c64b0c3a7ffb76d94024c4fb7862db3f9255244cb6290966ffea6967f3f8e5fc8db1e9b73166128b5ce955accc700125df7f258ac7caa0aa2cc9bbd397ba10bd7b9dad8679ea28df1a739ffffffffd92fe5ff53bffe529ff4cbd1080000cfbaf4214c5d3467676a14cbaf3446629d68f8b5a108f9b76011222042875346869c9919a302a46a8a44a58ab4e79807579808021f51e891b284985c1279623d69f5a10c83b8d2f5232cceaaa55604edbf94931cae64a1b295ed567a5fffb9264300203bc584fb32913e2320949ea1c02d41005773acca4b140c72a286cd0171c8ef7ebebf4af797d53f5d55e82f2d56ac533f137fedf58b3000220c000003b5072e2b0c8a44048748b2a88a2432a09d54fdf5d1b5fa53ffffd9b213df5fffd17fc1e53dcb3c5dfff7949001fb5c5a80f515d021f4e043341d43f8e2925dc8a105b3655476f961a0bdd0e9d3ec8181c58e02828234dd6a412110ad62461898c9a1a46d055bd1d0ac79997ebd39e968c18873a194c653661718ec53b22a10d435d25b2b223375fea86abc62b9c504c236c8852d4eff5fd37553bbd985c83a1e667b10459a3caf1a82eb1206008012207e9949cacd51507912a31b2a6b698687dfb7f5afff8b1c766f62e353fff0d7fe2a3fc3c3bf892d471d077fcb56a018000800a6dc630a5c15a150834b5c6c4cbf8c32014ad829d87f28675e787c90d1f645289a28d32a2138d30aa1b6e4dfdfd38cb86da622bfd8b94c7207b68ef77bd2557dd3583fad1cb222211dc0661a9c727bb7e826a16526f4ee9cd5fffa7b471fbf7fd856b2ec7c0f939f7d2b8dfba0d2611c1497c7d3e6c46585f9657a1867ffffb92644100c3883750d30913d23326d9b101820e0d1cbf432c246d80d98b254007ac38a7503389a3d5f416daaf7fe74ffe9ffa7fffb7ffe8140312e796efc9791c35ffffcf6004280177ec1d911be0b00914e53ee9fad3988bad1f62733193e381a794a10948a350a249e9792a813ca4f17eb2d3efc22514c749a913941a647b9fcaedb6dac4133bed162e18c0c389a830036161ae5984b829c5140ab998b8a3ce4036cce1411a82faadc2f71192f55a612365841221b80fb55c3642e8e438c61479972b6b223b2e1fc92314b4ebd524d729bf49de9e956a8cd0191abd6c573df25ffffd15005175b700db34930d3031202b5d9f2feaa40117fae56693a0a9b306674dab1feba76fb89caa76667c74c5bf5ddc70b13247f1c44b2eaaa2cacdec04c172ac7b8d82a505869d1c3d2895116af8529377a489a2ea629a5dad45672b49f0d3d5b16b0c28c9014b12a0092cb009ffce49a119320414eb08f420b919e1b0e958059e504f47b14521055417b740cb2ca8e3fe6fffeb29da4c1f30e80c4f2cdea61277c430009ab96a79831a3ba0ec40cae5834d416fd2e2248b0492f08761fffb92645e0843551d4f134c4b4036c469513d27580cdc7740cc30cac0ca8b261c178870ed73f10e8b9739c638d382aca5031fdedb937c8458d7206c91a298ed023c3c782324c8c7937beca64c4aa0b86056546b8743fbce390f7294ce88aaace03080c080e60905180f3c7b5ef70a01d001100420f595295278863ae015a9c52a0f79569f6d57dab527984c71e27d06e061efebd5fe92fa59fe8fd9fd2bfff5e8ffd6000a1024285b5ab2100490e080af09875d371892eb00a1903001e4b28d840704a4a6587976b186fe38d49f0ea64ac784073285977badb5614d4435cf8f3f5a7ba68e9e2cd1283e2e2471914301f10b85f172f7e44594ad8e538112a4dcf45ee889ad65282ef1af7a8d8fe5e1718480c0142807f7fa164b62a9034d355ee254fbace6bcbfe8b25ffffcf25f27a6f9be7bffffffffffffffffe656441225e4e4f7af00430ae685230813d29309a4422adb6f6240652c94ca4145f295f488e896cce1b4876ec35471e84e32bbf7b3bd491408d28af0d11ee0c431ef3b63469fdfeec237b0863fdbd308493089a040808f6cee57d6c2ea6f4a40580f4201e00a06fffb92647f80037223d0630c32603aea9a072c228e500d854fac187388ee98aa703c88962c1082d13d0acb12bba165d7d3175cf44a648697d0abdfcbcff2bc5afafc19ce7f5f6264dc5f8ce7e09da40aa0a64aab0babd30826cbd0072100d14c15082184b1d4fa11b6db9feebe4ffdd09ee691cfec4bce72031e11fa26064f77ffc9ffff556cd7dd92f5d5c10040024a51d253b6cd6c4032f8b647d15519932d2e4b1436d76ce480ca80a35e3b9b968094658d929345d13089851d8cdb95b70637aef332e6913b2a741a1e5460340d228ea3c1a59140c3d1563e7a13b26de1d72770bf45f9e18f60e68745d83dc70c1f0d25f68f3e001802000000038218818f534252f48f4aa055510e1c293d107eb96a9f3eb3f3ae2de0d2570965b25caac34b4ba7b51b5b59d32adfffabffffa0005c6d4765458592684a50a34aeb2e93704455dec29d37a60167ef0d3888f1d252ad25332eac39ad3965100615612c0bbe9c71144b82a833c74fc9519a47f0c2500993a54a896f70a878d871375ea2eb676311544b6bb2f0901ab2111834850eb0899110e486102a91750010840092afb4d833fffb92648b80034f1ed2530f32a039e1c9dd170c160d4c9d426c246ec0ce0b2698f608e8c7402a45c228204929088490b1d6a8f24dca55a1036fb7e652877a51cfdedb6b00ba8bfee77c1cc87d2e5a10008000a48dc43827fbf8a8587a86aa62a95953e6e7a9ba6043f5d6f4f54274e23d66d36f574937c69534866ad2705ba6986094945b4764df73206679b9a4bcf3763394d762f64cb17b4eea09daef4dc97fb51b8a5696a664d62eac90c71d34307404a0d0b2986f0600018eb27b775e14f24cb2ac2659021ab1a662ee4a8e43e72711c1671525106fbfa780dedfc8ffefecdf5feadfefffc61da9de8313f94fffeb4004d450462058006d26a36a814e5969940120c5c945091246430bb12459e34f2dac41393f2b84e94d17744291030e1270425004dd88168e2a478738531d3ea53342a481a1328061e0c14d262a2e25ca9dff96b21b13ba0af3e3177365c46e5bc9bca83a090d22e86c300278b504c03c404a002d307cae268dc7305fb828178f71b2aa3c8c784f54384370033aeac47d3e5bfb2e38fdded5499b1587e54b863f7e5d432a00184490a6b6d56f223a02d630fffb9264a980c33e34d0d3091bc03a46d9936185640dec793c6cb0ce80cf86e68cc788a095190a3f16e9765a7919bd7741fd75e5f382e18383a08a20e38a41751cae2e5332089c60f42cc463e4228743e22f175456774524cb14777429c4c7987154ec394d6127453fabffffffc64af9b4525c3a608454d06848963472d0e2c384014caa66846642031180480ac427691459d04240790879924bd3cad3ad9d00884b140e74dbc13157e47f9447f7fedfe2540bb4137905103cb78ffb5608802007568d8321e61317181c0bfe7bea29820bc200905c09fe613358b054580c0804ff80a2080d08470cba232c0c8e1e00d1d818d02810004391181c028461f2002894092205cc4587243f2f00618868402404490960a488522a8abe1c98100088d186b0ef4d1353249ff19e234700b8989f1828d5a2afe2811d028c38888117312f1714e8a3eaff9a9324a1323923b0860e31dab1e55ea4ba5ffc690e21d45f2e0d22084a0fb16690319015f1fc8898a2c9296a5398a2a5adbfff92c5426ce7ff8500ba82024000405030371f8c06028049002ca9f0da136f09d16baf74f3b3fe44574dfffb9264c580038242515560a00036e159b7a78c009869a11a39ca80015220e8771a50007dc8a57ffc38203478b87111cabfce2a0c1c183479b4472ff1714110e8b0a30887bffff162099448284c09ffc4a04153670c841b4c414d45332e3130305555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555554c414d45332e313030555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555fffb9264408ff00000690700000800000d20e00001000001a4000000200000348000000455555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555') as BlobPart], "嘖.mp3");
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
  storeLocationData(coords, playState, pauseSong, resumeSong, dispatch);

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
