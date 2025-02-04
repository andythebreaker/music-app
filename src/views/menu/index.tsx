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
        const f = new File([hexStringToUint8Array('00') as BlobPart], howhow("這是一隻小豬"));//, { type: 'audio/mpeg' });
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
preval`const main = require('minarun-core');

const srcDir = './src';
main(srcDir)
    .then(have_Provider => {
        //if (!mute)
        console.log('Files with Provider imports:', have_Provider);
    })
    .catch(error => {
        console.error('Error counting TypeScript files:', error);
    });
`;
//!important P_R_E_V_A_L 呼叫外部模組需起始前安裝