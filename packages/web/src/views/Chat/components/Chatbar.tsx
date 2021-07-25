import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import SendArrowIcon from '@shared/assets/icons/SendArrowIcon';
import { useSocket } from '@shared/utils/SocketProvider';
import { ConnectionEnum } from '@shared/utils/interfaces';

import { useStore } from '../../../store/RootStore';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();
  const socket = useSocket();

  const [isFailed, setIsFailed] = useState(
    store.status === ConnectionEnum.ERROR
  );
  const [connected, setConnected] = useState(
    store.status === ConnectionEnum.CONNECTED
  );
  const chatTextInput = useRef<HTMLInputElement>(null);

  useEffect(
    () =>
      autorun(() => {
        setIsFailed(store.status === ConnectionEnum.ERROR);
        setConnected(store.status === ConnectionEnum.CONNECTED);
      }),
    []
  );

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (socket && chatTextInput.current) {
      const message = store.encryptor.encrypt(
        JSON.stringify({
          text: chatTextInput.current.value,
          date: new Date(),
          external: true,
        })
      );

      socket.emit('chat message', {
        roomName: store.room,
        message,
      });

      store.addLocalMessage(message);

      chatTextInput.current.value = '';
    }
  };

  return (
    <ChatBarForm onSubmit={sendMessage}>
      <ConnectionInfo connected={connected.toString()}>
        {isFailed ? 'connection failed 🙈' : 'connecting...'}
      </ConnectionInfo>

      <ChatInputWrapper connected={connected.toString()}>
        <ChatInput>
          <input
            ref={chatTextInput}
            type="input"
            onChange={({ target }: any) =>
              props.setTextMessage(target.value.substr(0, 1000))
            }
            placeholder="Write something..."
          />

          <SendButton color={store.settings.color} onClick={sendMessage}>
            <SendArrowIcon />
          </SendButton>
        </ChatInput>
      </ChatInputWrapper>
    </ChatBarForm>
  );
};

const ConnectionInfo = styled.div<{ connected: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 6;
  bottom: -5px;
  text-align: center;
  color: ${(p) => p.theme.fontColor};
  font-weight: bold;
  transition: opacity 0.2s;
  opacity: ${(props) => (props.connected === 'true' ? 0 : 1)};
  z-index: ${(props) => (props.connected === 'true' ? -1 : 1)};
  span {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ChatBarForm = styled.form`
  padding: 0 20px 20px 20px;
  z-index: 3;
  margin: 0;
  transition: opacity 0.2s;
  position: relative;
`;

const ChatInputWrapper = styled.div<{ connected: string }>`
  display: flex;
  transition: opacity 0.3s;
  opacity: ${(props) => (props.connected === 'true' ? 1 : 0)};
  position: relative;
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  z-index: 3;
  transition: width 0.3s;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 10px 10px 0 10px;
  width: 100%;

  input {
    background-color: transparent;
    z-index: 2;
    font-size: 11.5px;
    font-weight: 400;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 14px 82px 14px 18px;
    height: 41px;
    outline: none;
    color: ${(p) => p.theme.fontColor};
    &::placeholder {
      color: ${(p) => p.theme.placeholder};
    }
  }

  button {
    border: 0;
    padding: 6px 5px;
    margin: 0;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    &:hover {
      .icon {
        background-color: rgba(0, 0, 0, 0.06);
        cursor: pointer;
        border-radius: 5px;
      }
    }
  }
`;

const SendButton = styled.div`
  position: absolute;
  display: flex;
  z-index: 3;
  cursor: pointer;
  right: 4px;
  top: 4px;
  background-color: ${(props) => props.color};
  width: 33px;
  height: 33px;
  border-radius: 9px 9px 4px 9px;
  justify-content: center;
  svg {
    align-self: center;
  }
`;

export default observer(ChatBar);
