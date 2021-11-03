import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import EmojiIcon from '@fc/shared/assets/icons/EmojiIcon';
import SendArrowIcon from '@fc/shared/assets/icons/SendArrowIcon';
import Tooltip from '@fc/shared/components/Tooltip';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { useStore } from '../../../store/RootStore';

import { GiphyGrid } from './GiphyGrid';

export const ChatBar: FunctionComponent = observer(() => {
  const store = useStore();
  const socket = useSocket();
  const emojiPickerRef = useRef<React.ElementRef<typeof Tooltip>>(null);
  const chatTextInput = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState('');

  const [isFailed, setIsFailed] = useState(
    store.status === ConnectionEnum.ERROR
  );
  const [connected, setConnected] = useState(
    store.status === ConnectionEnum.CONNECTED
  );

  useEffect(
    () =>
      autorun(() => {
        setIsFailed(store.status === ConnectionEnum.ERROR);
        setConnected(store.status === ConnectionEnum.CONNECTED);
      }),
    []
  );

  const sendMessage = (e: any, msg?: string) => {
    e.preventDefault();

    const text = msg || messageText;

    if (socket && chatTextInput.current && text) {
      const message = store.encryptor.encrypt(
        JSON.stringify({
          text,
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
      setMessageText('');
    }
  };

  return (
    <>
      <GiphyGrid
        store={store}
        setTextMessage={(p) => {
          props.setTextMessage(p);
          chatTextInput.current.value = '';
        }}
        textMessage={props.textMessage}
      />
      <ChatBarForm onSubmit={sendMessage}>
        <ConnectionInfo connected={connected}>
          {isFailed ? 'connection failed 🙈' : 'connecting...'}
        </ConnectionInfo>

        <ChatInputWrapper connected={connected}>
          <ChatInput>
            <input
              ref={chatTextInput}
              type="input"
              onChange={({ target }: any) =>
                setMessageText(target.value.substr(0, 1000))
              }
              placeholder="Write something ..."
            />

            <Tooltip
              ref={emojiPickerRef}
              style={{
                paddingTop: 11,
                paddingBottom: 11,
                paddingLeft: 17,
                paddingRight: 17,
              }}
              handler={React.forwardRef(
                (p, ref: React.ForwardedRef<HTMLInputElement>) => (
                  <EmojiPickerStyled {...p} ref={ref}>
                    <EmojiIcon />
                  </EmojiPickerStyled>
                )
              )}
            >
              <EmojiList>
                {['😂', '😊', '👍', '🙈', '🔥', '🤔', '💩', '🚀'].map(
                  (emoji) => (
                    <span
                      key={emoji}
                      data-emoji={emoji}
                      onClick={(e) => {
                        sendMessage(e, emoji);
                        emojiPickerRef.current.hide();
                      }}
                    />
                  )
                )}
              </EmojiList>
            </Tooltip>

            <SendButton color={store.settings.color} onClick={sendMessage}>
              <SendArrowIcon />
            </SendButton>
          </ChatInput>
        </ChatInputWrapper>
      </ChatBarForm>
    </>
  );
});

const EmojiList = styled.div`
  display: flex;
  font-size: 25px;
  width: 240px;
  justify-content: space-between;
  span {
    cursor: pointer;
    &::after {
      content: attr(data-emoji);
    }
  }
`;

const EmojiPickerStyled = styled.div`
  position: absolute;
  right: 51px;
  top: 11px;
  z-index: 5;
  cursor: pointer;
`;

const ConnectionInfo = styled.div<{ connected: boolean }>`
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
  opacity: ${(props) => (props.connected ? 0 : 1)};
  z-index: ${(props) => (props.connected ? -1 : 1)};
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

const ChatInputWrapper = styled.div<{ connected: boolean }>`
  display: flex;
  transition: opacity 0.3s;
  opacity: ${(props) => (props.connected ? 1 : 0)};
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
