// store
import { observer } from 'mobx-react';
import React, { useRef, FunctionComponent } from 'react';
import styled from 'styled-components';
// components
import Tooltip from '../../../components/Tooltip';
// shared
import { withSocketContext } from '../../../shared/SocketProvider';
import { useStore } from '../../../store';

interface SettingsProps {
  socket: SocketIOClient.Socket;
}

const AvatarPickerComponent: FunctionComponent<SettingsProps> = (props) => {
  const store = useStore();
  const pickerRef = useRef(null);

  return (
    <Tooltip
      shadow
      ref={pickerRef}
      offsetHorizontal={29}
      placement="bottom"
      handler={observer(
        React.forwardRef((p, ref) => (
          <AvatarPickerAction {...p} ref={ref}>
            {store.settings.avatar}
          </AvatarPickerAction>
        ))
      )}
    >
      <AvatarPicker>
        {['', '🐵', '🐮', '🐷', '🐨', '🦊', '🐻', '🐶', '🐸', '🐹'].map(
          (emoji) => (
            <div
              key={emoji}
              className={
                (emoji === '' ? 'empty ' : ' ') +
                (emoji === store.settings.avatar ? 'active' : '')
              }
              onClick={() => {
                pickerRef.current.hide();
                store.persistSettings(
                  {
                    avatar: emoji,
                  },
                  props.socket
                );
              }}
            >
              {emoji}
            </div>
          )
        )}
      </AvatarPicker>
    </Tooltip>
  );
};

const AvatarPickerAction = styled.div`
  width: 59px;
  height: 59px;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 18px 18px 3px 18px;
  font-size: 28px;
  text-align: center;
  line-height: 62px;
  cursor: pointer;
`;

const AvatarPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 245px;
  flex-wrap: wrap;
  margin: -5px 0;
  div {
    position: relative;
    margin: 5px 0;
    width: 41px;
    height: 41px;
    border: 1px solid ${(p) => p.theme.backgroundColorInverse};
    border-radius: 14px 14px 3px 14px;
    text-align: center;
    font-size: 18px;
    line-height: 40px;
    overflow: hidden;
    cursor: pointer;
    &.active {
      background-color: ${(p) => p.theme.backgroundColorInverse};
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
  }
`;

export default withSocketContext(observer(AvatarPickerComponent));
