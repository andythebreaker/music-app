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

/**for debug */
const sdebug = withReactContent(Swal);
/**for speech */
preval`
const targetSTR = "達成目標十公里";
const fs = require('fs');
const path = require('path');
const fetch = require('make-fetch-happen').defaults({
  cachePath: './my-cache' // path where cache will be written (and read)
});
fetch('http://api.zhconvert.org/convert?converter=Pinyin&text='+targetSTR+'&prettify=1').then(res => {
  return res.json() // download the body as JSON
}).then(body => {
  console.log(body.data.text);

const directoryPath = './public/zhconvert';
const fileName = targetSTR+'.txt';
const fileContent = body.data.text;

// Check if the directory exists, and if not, create it
if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
}

const filePath = path.join(directoryPath, fileName);

// Write the file content to the specified path
fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('success');
    }
});

  module.exports = "TS bad";
});
`;

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
        const f = new File([hexStringToUint8Array('00') as BlobPart], "prevalNG");//, { type: 'audio/mpeg' });
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
