// store
import { observer } from 'mobx-react';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
// components
import Tooltip from '../../../components/Tooltip';
// shared
import { withSocketContext } from '../../../shared/SocketProvider';
import { useStore } from '../../../store';
import { colors } from '../../../shared/constants';

interface SettingsProps {
  socket: SocketIOClient.Socket;
}

const ColorPickerComponent: FunctionComponent<SettingsProps> = (props) => {
  const store = useStore();

  return (
    <Tooltip
      placement="bottom"
      handler={observer(
        React.forwardRef((p, ref) => (
          <ColorPickerAction
            {...p}
            ref={ref}
            style={{ backgroundColor: store.settings.color }}
          />
        ))
      )}
    >
      <ColorPicker>
        {Object.keys(colors).map((color) => (
          <div
            key={color}
            onClick={() => {
              store.persistSettings(
                {
                  color,
                },
                props.socket
              );
            }}
            className={`color ${store.settings.color === color && ' active'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </ColorPicker>
    </Tooltip>
  );
};

const ColorPickerAction = styled.div`
  width: 59px;
  height: 59px;
  cursor: pointer;
  background-color: #eceff4;
  border-radius: 18px 18px 18px 3px;
  position: relative;
  &::before {
    content: '';
    border-width: 0 1px 1px 0;
    border-color: #fff;
    border-style: solid;
    height: 7px;
    width: 7px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
  }
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 245px;
  flex-wrap: wrap;
  margin: -5px 0;
  .color {
    margin: 5px 0;
    width: 41px;
    height: 41px;
    border-radius: 18px 18px 3px 18px;
    cursor: pointer;
    position: relative;
    &.active {
      &::before {
        content: '';
        border-width: 0 1px 1px 0;
        border-color: rgba(0, 0, 0, 0.5);
        border-style: solid;
        height: 9px;
        width: 5px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
    }
  }
`;

export default withSocketContext(observer(ColorPickerComponent));
