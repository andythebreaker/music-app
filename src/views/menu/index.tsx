import { FaPlus } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
/**for debug */
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { Header } from '../../components';
import { ADD_SONGS, SET_GRID, SET_THEME, SET_VIEW, SET_VISUALIZER } from '../../redux/actions';
import './styles.css';

/**for debug */
const sdebug = withReactContent(Swal);
function hexStringToUint8Array(hexString: string): Uint8Array {//TODO TO util
  const length = hexString.length;
  const uint8Array = new Uint8Array(length / 2);

  for (let i = 0; i < length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    uint8Array[i / 2] = byteValue;
  }

  return uint8Array;
}


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
        var f = new File([hexStringToUint8Array('00') as BlobPart], "測試因檔文字");
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
