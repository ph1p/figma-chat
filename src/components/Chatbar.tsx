import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
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

  const sendMessage = (message: string) => {
    props.sendMessage(message);
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
          <div>{store.selectionCount}</div>
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
            handler={React.forwardRef((p, ref) => (
              <EmojiPickerStyled {...p} ref={ref}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                >
                  <path
                    fill="#A2ADC0"
                    d="M9.153 13.958a5.532 5.532 0 01-5.122-3.41.394.394 0 01.585-.482.396.396 0 01.146.178 4.741 4.741 0 004.391 2.923c.625 0 1.244-.124 1.82-.365a4.72 4.72 0 002.558-2.558.396.396 0 01.73.305 5.51 5.51 0 01-2.984 2.983 5.499 5.499 0 01-2.124.426z"
                  />
                  <path
                    fill="#A2ADC0"
                    d="M9 18c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9zM9 .75C4.451.75.75 4.451.75 9c0 4.549 3.701 8.25 8.25 8.25 4.549 0 8.25-3.701 8.25-8.25C17.25 4.451 13.549.75 9 .75z"
                  />
                  <circle cx="11.646" cy="6" r="1" fill="#A2ADC0" />
                  <circle cx="6.646" cy="6" r="1" fill="#A2ADC0" />
                </svg>
              </EmojiPickerStyled>
            ))}
          >
            <EmojiList>
              <span data-emoji="😂" />
              <span data-emoji="😊" />
              <span data-emoji="👍" />
              <span data-emoji="🙈" />
              <span data-emoji="🔥" />
              <span data-emoji="🤔" />
              <span data-emoji="💩" />
            </EmojiList>
          </Tooltip>

          <SendButton color={store.settings.color} onClick={sendMessage}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.38396 1.47595H8.55196M8.55196 1.47595V7.64395M8.55196 1.47595L1.35596 8.67195"
                stroke="white"
                strokeWidth="1.028"
              />
            </svg>
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
  background-color: #eceff4;
  border-radius: 10px 10px 0 10px;
  /* width: ${(p) => (p.hasSelection ? '225px' : '100%')}; */
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
  background-color: #eceff4;
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
  &:hover {
    div {
      opacity: 1;
    }
  }
  div {
    position: relative;
    min-width: 12px;
    height: 12px;
    padding: 0 2px;
    text-align: center;
    margin: 0 auto;
    background-color: #a2adc0;
    color: #eceff4;
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
