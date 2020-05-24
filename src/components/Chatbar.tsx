import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled, { css } from 'styled-components';
import EmojiIcon from '../assets/icons/Emoji';
import SendArrowIcon from '../assets/icons/SendArrow';
import { ConnectionEnum } from '../shared/interfaces';
import { useStore } from '../store';
import Tooltip from './Tooltip';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();
  const isSettings = useRouteMatch('/settings');
  const emojiPickerRef = useRef(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isFailed, setIsFailed] = useState(
    store.status === ConnectionEnum.ERROR
  );
  const [isConnected, setIsConnected] = useState(
    store.status === ConnectionEnum.CONNECTED
  );
  const chatTextInput = useRef(null);

  useEffect(
    () =>
      autorun(() => {
        setIsFailed(store.status === ConnectionEnum.ERROR);
        setIsConnected(store.status === ConnectionEnum.CONNECTED);

        setHasSelection(Boolean(store.selectionCount));
      }),
    []
  );

  const sendMessage = (e) => {
    props.sendMessage(e);
    chatTextInput.current.value = '';
  };

  return (
    <ChatBarForm isSettings={isSettings} onSubmit={sendMessage}>
      <ConnectionInfo isConnected={isConnected}>
        {isFailed ? <>connection failed 🙈</> : 'connecting...'}
      </ConnectionInfo>

      <ChatInputWrapper isConnected={isConnected}>
        <SelectionCheckbox
          checked={props.selectionIsChecked}
          hasSelection={hasSelection}
          onClick={() => {
            props.setSelectionIsChecked(!props.selectionIsChecked);
            chatTextInput.current.focus();
          }}
        >
          <div>{store.selectionCount < 10 && store.selectionCount}</div>
        </SelectionCheckbox>
        <ChatInput hasSelection={hasSelection}>
          <input
            ref={chatTextInput}
            type="input"
            onChange={({ target }: any) =>
              props.setTextMessage(target.value.substr(0, 1000))
            }
            placeholder={`Write something ... ${
              props.selectionIsChecked ? '(optional)' : ''
            }`}
          />

          <Tooltip
            ref={emojiPickerRef}
            handler={React.forwardRef((p, ref) => (
              <EmojiPickerStyled {...p} ref={ref}>
                <EmojiIcon />
              </EmojiPickerStyled>
            ))}
          >
            <EmojiList>
              {['😂', '😊', '👍', '🙈', '🔥', '🤔', '💩'].map((emoji) => (
                <span
                  key={emoji}
                  data-emoji={emoji}
                  onClick={(e) => {
                    props.setTextMessage(emoji);
                    sendMessage(e);
                    emojiPickerRef.current.hide();
                  }}
                />
              ))}
            </EmojiList>
          </Tooltip>

          <SendButton color={store.settings.color} onClick={sendMessage}>
            <SendArrowIcon />
          </SendButton>
        </ChatInput>
      </ChatInputWrapper>
    </ChatBarForm>
  );
};

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

const ConnectionInfo = styled.div`
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
  color: #000;
  font-weight: bold;
  transition: transform 0.2s;
  transform: translateY(${({ isConnected }) => (isConnected ? 69 : 0)}px);
  span {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ChatBarForm = styled.form`
  padding: 14px;
  z-index: 3;
  margin: 0;
  transition: opacity 0.2s;
  position: relative;
  opacity: ${({ isSettings }) => (isSettings ? 0 : 1)};
`;

const ChatInputWrapper = styled.div`
  display: flex;
  transition: opacity 0.3s;
  opacity: ${({ isConnected }) => (isConnected ? 1 : 0)};
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
    font-weight: 300;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 14px 82px 14px 18px;
    height: 41px;
    outline: none;
    color: ${(p) => p.theme.fontColor};
    &::placeholder {
      color: #a2adc0;
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
  background-color: ${({ color }) => color};
  width: 33px;
  height: 33px;
  border-radius: 9px 9px 4px 9px;
  justify-content: center;
  svg {
    align-self: center;
  }
`;

const SelectionCheckbox = styled.div`
  animation-delay: 0.2s;
  transition: all 0.2s;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 10px;
  height: 41px;
  width: ${(p) => (p.hasSelection ? 49 : 0)}px;
  margin-right: ${(p) => (p.hasSelection ? 8 : 0)}px;
  opacity: ${(p) => (p.hasSelection ? 1 : 0)};
  overflow: hidden;
  display: flex;
  justify-items: center;
  align-items: center;
  cursor: pointer;
  ${(p) =>
    p.checked &&
    css`
      box-shadow: inset 0px 0px 0px 1px #a2adc0;
    `};
  &:hover {
    div {
      opacity: 1;
    }
  }
  &:active {
    opacity: 0.8;
  }
  div {
    position: relative;
    min-width: 12px;
    height: 12px;
    padding: 0 2px;
    text-align: center;
    margin: 0 auto;
    background-color: #a2adc0;
    color: ${(p) => p.theme.secondaryBackgroundColor};
    font-weight: bold;
    font-size: 10px;
    opacity: ${(p) => (p.checked ? 1 : 0.5)};
    &::after {
      content: '';
      position: absolute;
      height: 1px;
      top: 0;
      left: -3px;
      right: -3px;
      background-color: #a2adc0;
      box-shadow: 0 11px 0px #a2adc0;
    }
    &::before {
      content: '';
      position: absolute;
      width: 1px;
      left: 0;
      top: -3px;
      bottom: -3px;
      background-color: #a2adc0;
      box-shadow: 11px 0px 0px #a2adc0;
    }
    &:hover {
      border-color: rgba(255, 255, 255, 1);
    }
  }
`;

export default observer(ChatBar);
