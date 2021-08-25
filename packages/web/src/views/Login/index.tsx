import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import styled from 'styled-components';

import { useSocket } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { useStore } from '../../store/RootStore';

export const Login = observer(() => {
  const store = useStore();
  const socket = useSocket();
  const [room, setRoom] = useState('');
  const [secret, setSecret] = useState('');

  const enterRoom = () => {
    if (socket) {
      store.setSecret(secret);
      store.setRoom(room);

      socket.connect();
    }
  };

  if (store.status !== ConnectionEnum.CONNECTED) {
    return (
      <>
        {store.status === ConnectionEnum.ERROR
          ? 'connection failed 🙈'
          : 'connecting...'}
      </>
    );
  }

  return (
    <Wrapper>
      <div>
        <label htmlFor="room">Room</label>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.currentTarget.value)}
        />
        <label htmlFor="secret">Secret</label>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.currentTarget.value)}
        />

        <button onClick={enterRoom}>Enter Room</button>
      </div>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
  padding: 30px;
  height: 100%;
  justify-content: center;

  label {
    margin: 0 0 5px;
    color: #a2adc0;
    font-size: 12px;
    display: block;
  }
  input[type='text'] {
    margin-bottom: 20px;
    font-size: 14px;
    text-align: center;
    width: 100%;
    border-width: 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.fontColor};
    padding: 8px 18px 9px;
    outline: none;
    border-radius: 7px;
    font-weight: 400;
    &::placeholder {
      color: #999;
    }
    &:focus {
      border-color: #1e1940;
    }
  }
  button {
    color: ${(p) => p.theme.fontColor};
    background-color: ${(p) => p.theme.secondaryBackgroundColor};
    border: 0;
    padding: 10px 14px;
    border-radius: 4px;
    cursor: pointer;
  }
`;
