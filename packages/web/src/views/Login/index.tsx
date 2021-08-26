import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import styled from 'styled-components';

import { useSocket } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { useStore } from '../../store/RootStore';

export const Login = observer(() => {
  const store = useStore();
  const socket = useSocket();
  const [authString, setAuthString] = useState('');

  const enterChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      socket.connect();

      const [room, secret] = Buffer.from(authString, 'base64')
        .toString('utf8')
        .split(';');

      if (room && secret) {
        socket.emit('login', {
          secret,
          room,
          settings: toJS(store.settings),
        });

        socket.once('login succeeded', () => {
          store.setSecret(secret);
          store.setRoom(room);
          socket.connect();
        });

        socket.once('login failed', () =>
          store.addNotification('Credentials not valid')
        );
      } else {
        store.addNotification('Enter a room and a secret');
      }
    }
  };

  if (store.status !== ConnectionEnum.CONNECTED) {
    return (
      <Wrapper>
        <Info>
          {store.status === ConnectionEnum.ERROR
            ? "Can't connect to the server 🙈"
            : 'connecting...'}
        </Info>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <form onSubmit={enterChat}>
        <label htmlFor="auth-string">Auth-String</label>
        <input
          type="text"
          value={authString}
          onChange={(e) => setAuthString(e.currentTarget.value)}
        />

        <button type="submit" className="button">
          Enter Chat
        </button>
      </form>
    </Wrapper>
  );
});

const Info = styled.div`
  font-size: 14px;
  text-align: center;
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
  padding: 30px;
  height: 100%;
  justify-content: center;
  form {
    width: 80%;
    margin: 0 auto;
  }

  label {
    margin: 0 0 5px;
    color: #a2adc0;
    font-size: 12px;
    display: block;
  }
  input[type='text'] {
    margin-bottom: 20px;
    font-size: 14px;
    width: 100%;
    border-width: 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.fontColor};
    padding: 8px 10px 9px;
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
`;
