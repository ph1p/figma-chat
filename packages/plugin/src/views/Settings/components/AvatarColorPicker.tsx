import { observer } from 'mobx-react-lite';
import { lighten, rgba } from 'polished';
import React, { useRef, FunctionComponent, useCallback } from 'react';
import styled from 'styled-components';

import Tooltip from '@fc/shared/components/Tooltip';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { EColors } from '@fc/shared/utils/constants';

import { useStore } from '../../../store';

const AvatarColorPicker: FunctionComponent = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const pickerRef = useRef(null);

  const persistCurrentUser = useCallback(
    (data) => {
      pickerRef.current.hide();
      store.persistCurrentUser(data, socket);
    },
    [socket]
  );

  return (
    <Tooltip
      shadow
      ref={pickerRef}
      placement="bottom"
      handler={observer(
        (p, ref) => (
          <AvatarColorPickerAction
            color={store.currentUser.color}
            {...p}
            ref={ref}
          >
            {store.currentUser.avatar || (
              <img width="100%" src={store.currentUser.photoUrl} />
            )}
          </AvatarColorPickerAction>
        ),
        {
          forwardRef: true,
        }
      )}
    >
      <Wrapper>
        <ItemWrapper>
          {[
            '',
            '🐵',
            '🐮',
            '🐷',
            '🐨',
            '🦊',
            '🐻',
            '🐶',
            '🐸',
            '🐹',
            '🦄',
            '🐔',
            '🐧',
            '🐦',
            '🐺',
            '🦋',
            '🐥',
            '🐝',
          ].map((emoji) => (
            <Item
              key={emoji}
              className={emoji === store.currentUser.avatar ? 'active' : ''}
              onClick={() => {
                pickerRef.current.hide();
                persistCurrentUser({
                  avatar: emoji,
                });
              }}
            >
              {emoji || <img width="100%" src={store.currentUser.photoUrl} />}
            </Item>
          ))}
        </ItemWrapper>

        <ItemWrapper className="colors">
          {Object.keys(EColors).map((color) => (
            <Item
              key={color}
              onClick={() => {
                pickerRef.current.hide();
                persistCurrentUser({
                  color,
                });
              }}
              className={`color ${
                store.currentUser.color === color && ' active'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </ItemWrapper>
      </Wrapper>
    </Tooltip>
  );
});

const AvatarColorPickerAction = styled.div<{ color: string }>`
  width: 72px;
  height: 72px;
  background-color: ${(p) => p.color};
  border-radius: 100%;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  align-self: center;
  font-size: 39px;
  line-height: 75px;
  box-shadow: 0 0 0 15px ${(p) => rgba(p.color, 0.1)},
    0 0 0 35px ${(p) => rgba(p.color, 0.08)};
`;

const ItemWrapper = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  &.colors {
    grid-template-columns: repeat(10, 1fr);
    background-color: ${(p) => lighten(0.1, p.theme.tooltipBackgroundColor)};
    border-top: 1px solid ${(p) => p.theme.backgroundColorInverse};
    padding: 10px;
    margin: 15px -15px -15px;
    border-radius: 0 0 20px 20px;
  }
`;

const Item = styled.div`
  position: relative;
  width: 41px;
  height: 41px;
  border: 1px solid ${(p) => p.theme.backgroundColorInverse};
  border-radius: 100%;
  text-align: center;
  font-size: 18px;
  line-height: 40px;
  overflow: hidden;
  cursor: pointer;
  &.active {
    background-color: ${(p) => p.theme.backgroundColorInverse};
  }
  &.color {
    width: 24px;
    height: 24px;
    border: 0;
    position: relative;
    &.active {
      &::after {
        content: '';
        position: absolute;
        left: 8px;
        top: 8px;
        width: 8px;
        height: 8px;
        background-color: #fff;
        border-radius: 100%;
      }
    }
  }
  &.empty {
    &::after {
      content: '';
      position: absolute;
      left: 19px;
      top: 13px;
      height: 14px;
      width: 1px;
      background-color: ${(p) => p.theme.backgroundColorInverse};
      transform: rotate(45deg);
    }
  }
`;

const Wrapper = styled.div`
  width: 280px;
`;

export default AvatarColorPicker;
