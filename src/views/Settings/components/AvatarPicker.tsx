// store
import { observer } from 'mobx-react';
import React, { FunctionComponent } from 'react';
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

  return (
    <Tooltip
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
        <div className="empty"></div>
        {['🐵', '🐮', '🐷', '🐨', '🦊', '🐻', '🐶', '🐸', '🐹'].map((emoji) => (
          <div
            key={emoji}
            onClick={() => {
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
        ))}
      </AvatarPicker>
    </Tooltip>
  );
};

const AvatarPickerAction = styled.div`
  width: 59px;
  height: 59px;
  background-color: #eceff4;
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
    margin: 5px 0;
    width: 41px;
    height: 41px;
    border: 1px solid #383168;
    border-radius: 18px 18px 3px 18px;
    text-align: center;
    font-size: 18px;
    line-height: 40px;
    overflow: hidden;
    cursor: pointer;
  }
`;

export default withSocketContext(observer(AvatarPickerComponent));
