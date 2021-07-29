import { observer } from 'mobx-react-lite';
import React, { useRef, FunctionComponent } from 'react';
import styled from 'styled-components';

import Tooltip from '@fc/shared/components/Tooltip';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { EColors } from '@fc/shared/utils/constants';

import { useStore } from '../../../store/RootStore';

const ColorPicker: FunctionComponent = observer(() => {
  const store = useStore();

  const socket = useSocket();
  const pickerRef = useRef<any>(null);

  return (
    <Tooltip
      shadow
      ref={pickerRef}
      offsetHorizontal={29}
      placement="bottom"
      handler={observer(
        (p: any, ref: any) => (
          <ColorPickerAction
            {...p}
            ref={ref}
            style={{ backgroundColor: store.settings.color }}
          />
        ),
        { forwardRef: true }
      )}
    >
      <Wrapper>
        {Object.keys(EColors).map((color) => (
          <div
            key={color}
            onClick={() => {
              pickerRef.current.hide();
              store.persistSettings(
                {
                  color,
                },
                socket
              );
            }}
            className={`color ${store.settings.color === color && ' active'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </Wrapper>
    </Tooltip>
  );
});

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

const Wrapper = styled.div`
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
    border-radius: 14px 14px 3px 14px;
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

export default ColorPicker;
