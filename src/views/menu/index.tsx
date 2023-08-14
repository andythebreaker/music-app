import { FaPlus } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
/**for debug */
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import preval from 'babel-plugin-preval/macro';

import { Header } from '../../components';
import { ADD_SONGS, SET_GRID, SET_THEME, SET_VIEW, SET_VISUALIZER } from '../../redux/actions';
import './styles.css';
import { hexStringToUint8Array } from '../../utils';
import howhow from '../../speech';

/**for debug */
const sdebug = withReactContent(Swal);

type MenuProps = {
  show: boolean;
  onClose: Function;
};

const Menu = ({ show, onClose }: MenuProps) => {
  const dispatch = useDispatch();

  const settings = useSelector((state: any) => state.settings);

  const menuMeta = [
    {
      id: 1,
      key: 'grid',
      name: 'Grid style song list',
      onClick: () => dispatch(SET_GRID(!settings.grid)),
    },
    {
      id: 2,
      key: 'visualizer',
      name: 'Show visualizer',
      onClick: () => dispatch(SET_VISUALIZER(!settings.visualizer)),
    },
    {
      id: 3,
      key: 'light',
      name: 'Light theme',
      onClick: () => dispatch(SET_THEME(!settings.light)),
    },
    {
      id: 4,//TODO remove this if debug don't need
      key: 'sdebug',
      name: 'sdebug tryout',
      onClick: () => {
        dispatch(SET_VIEW('map'));
        sdebug.fire({
          title: <p>sdebug</p>
        });
      }
    },
    {
      id: 5,
      key: 'addSongHex',
      name: 'add Song Hex',
      onClick: () => {
        const f = new File([hexStringToUint8Array('00') as BlobPart], howhow("這是一隻大豬"));//, { type: 'audio/mpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(f);//can do file list
        dispatch(ADD_SONGS(dataTransfer.files));
      }
    },
  ];

  return (
    <div className={`menu ${show ? 'menu--show' : ''}`.trim()}>
      <Header
        title={'Settings'}
        leftIcon={null}
        rightIcon={
          <div style={{ transform: 'rotate(45deg) translateY(2px)' }}>
            <FaPlus size={24} />
          </div>
        }
        onRightIconClick={() => onClose && onClose()}
      />
      <div className="menu__content">
        {menuMeta.map(({ id, key, name, onClick }) => (
          <div
            key={id}
            title={name}
            onClick={() => onClick()}
            className={`menu__item`}
          >
            <div className="menu__item__name">{name}</div>
            <div className="menu__item--spacer"> </div>
            {settings[key] ? (
              <MdCheckBox size={24} />
            ) : (
              <MdCheckBoxOutlineBlank size={24} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
//TODO其實我不知道cache的時效
preval`const mute=false;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;
const { Hash, createHash } = require('crypto');
const path = require('path');
const fetch = require('make-fetch-happen').defaults({
  cachePath: './my-cache' // path where cache will be written (and read)
});
var glob_keep_pth=''
async function findMp3FilesInDirectory(directory,bar) {
    try {
        const files = await fs.readdir(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await findMp3FilesInDirectory(filePath,bar); // Recursively search subdirectories
            } else if (path.extname(file) === '.mp3') {
                //-const h512 = createHash('sha512');
                //-h512.update(path.parse(file).name, 'utf8');
                //-const h512s = h512.digest('hex');
                
                //-console.log(file);//} @ $path.basename(path.dirname(filePath))} [$path.parse(file).name}]);
                
                //-const data = await fs.readFile(filePath);
                //-const hexString = Buffer.from(data).toString('hex');
                
                //const outputFile = '../src/speech/mp3/$path.basename(path.dirname(filePath))}/$h512s}.ts';
                //const outputContent = '/*do not modify this file, created by hexString-BOT; audio usage: How How; used: Fanhuaji*/ const SHA512_$h512s} : string= "$hexString}"; export default SHA512_$h512s};';
                
                //await fs.writeFile(outputFile, outputContent);
                
                //-console.log('Binary hex string array saved');
                if(path.parse(file).name===bar){
                  if(!mute) console.log("mp3found",filePath);
                  glob_keep_pth= filePath;
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

//findMp3FilesInDirectory('your_directory_path_here');

async function countTypeScriptFiles(dirPath) {
    const have_Provider = [];

    async function traverseDir(currentPath) {
        const files = await fs.readdir(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await traverseDir(filePath);
            } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
                const searchString_regex = "import *\\{? *preval *\\}? *from *[\\'|\\"]babel-plugin-preval\/macro[\\'|\\"] *\\;";
                var regex;
                try {
                  regex = new RegExp(searchString_regex);
                  //if(!mute)console.log('Regex created successfully:', regex);
                } catch (error) {
                  console.error('Error creating regex:', error.message);
                }
                const searchString=regex;
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    if (searchString.test(content)) {
                        have_Provider.push(filePath);
                    }
                } catch (err) {
                    console.error('Error reading the file:', err);
                }
            }
        }
    }

    await traverseDir(dirPath);
    if(!mute)console.log(have_Provider);

    const regexPattern = /howhow\\( *\\"([^\\(\\)]+)\\" *\\)/gm;
    for (let i = 0; i < have_Provider.length; i++) {
        const filePath = have_Provider[i];
        const fullPath = path.resolve(filePath);
        
        try {
            const data = await fs.readFile(fullPath, 'utf8');
            const matches = [...data.matchAll(regexPattern)];

            if (matches.length > 0) {
                if(!mute)console.log("Matches in file");
                for (let j=0;j<matches.length;j++) {
                  const match=matches[j];
                  //if (!mute) console.log(match[0]);
                  if (!mute) console.log(match[1]);
                
                  const res = await fetch('https://api.zhconvert.org/convert?converter=Pinyin&text=' + match[1] + '&prettify=1');
                  const body = await res.json();
                  if (!mute) console.log(body.data.text);
                  try{
                  const speech_main_ts = await fs.readFile('./src/speech/index.ts', 'utf8');
                  //if (!mute) console.log(speech_main_ts);
                  const jsonbot_finder =/const *bot *: *Bot *= *{([^}]+)} *;/gm;
                  const SOLjsonbot_finder = [...speech_main_ts.matchAll(jsonbot_finder)];
                  if (SOLjsonbot_finder.length !== 1) {if(!mute)console.log("[SOLjsonbot_finder] matches error => NEQ1");}else{
                    //if (!mute) console.log(SOLjsonbot_finder[0][1]);
                    const regex_replace = /([^, \\n:]+) *:/gm;
                    const subst = '"$1":';

                    // The substituted value will be contained in the result variable
                    const replace_result = (SOLjsonbot_finder[0][1]).replace(regex_replace, subst);

                    //console.log('Substitution result: ', replace_result);

                    var ansjson = JSON.parse('{'+replace_result+'}');
                    const h512=createHash("sha512");
                    h512.update(match[1],'utf8');
                    if (ansjson[h512.digest('hex')]===undefined){
                      if (!mute) console.log("ansjson[h512.digest('hex')]===undefined");
                      
                      const wordsArray = body.data.text.split(' ');
var mp3listM='#\\n';
for (let i = 0; i < wordsArray.length; i++) {
  if (!mute) console.log(wordsArray[i]);
  await findMp3FilesInDirectory("./local-dev/mp3",wordsArray[i]);
  mp3listM+=("file '"+(glob_keep_pth.replace(/\\\\/g,'/'))+"'\\n");
}
console.log(mp3listM);
await fs.writeFile('tmp_ffmpeg_mix.txt', mp3listM);
try {
  const { stdout, stderr } = await exec('ffmpeg -y -f concat -i tmp_ffmpeg_mix.txt -c copy output.mp3');
 
  console.log(stdout); 
 
  console.log("finish");
 } catch (error) {
  console.error(error.message);
 }

                    }else{
                      if (!mute) console.log("this word hit");
                    }
                  }
                  }catch(error_for_file_cant_read){console.log(error_for_file_cant_read);}
                }
            } else {
                if(!mute)console.log("No matches found");
            }
        } catch (err) {
            console.error('Error reading file:', err);
        }
    }
    return have_Provider;
}

const srcDir = './src';
countTypeScriptFiles(srcDir)
    .then(have_Provider => {
        if(!mute)console.log('Files with Provider imports:', have_Provider);
    })
    .catch(error => {
        console.error('Error counting TypeScript files:', error);
    });
`;