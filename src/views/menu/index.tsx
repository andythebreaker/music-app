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

preval`const fs = require('fs').promises;
const path = require('path');

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
                const searchString_regex = "import ?\\{? ?preval ?\\}? ?from ?[\\'|\\"]babel-plugin-preval\/macro[\\'|\\"] ?\\;";
                var regex;
                try {
                  regex = new RegExp(searchString_regex);
                  //console.log('Regex created successfully:', regex);
                } catch (error) {
                  console.error('Error creating regex:', error.message);
                }const searchString=regex;
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
    console.log(have_Provider);

    var regexPattern = /howhow\\( ?\\"([^\\(\\)]+)\\" ?\\)/gm;
    for (let i = 0; i < have_Provider.length; i++) {
        const filePath = have_Provider[i];
        const fullPath = path.resolve(filePath);
        
        try {
            const data = await fs.readFile(fullPath, 'utf8');
            const matches = [...data.matchAll(regexPattern)];

            if (matches.length > 0) {
                console.log("Matches in file");
                matches.forEach(match => {
                    console.log(match[0]);
                    console.log(match[1]);
                });
            } else {
                console.log("No matches found");
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
        console.log('Files with Provider imports:', have_Provider);
    })
    .catch(error => {
        console.error('Error counting TypeScript files:', error);
    });
`;