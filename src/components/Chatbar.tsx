import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import styled from 'styled-components';
import ColorPicker from './ColorPicker';
import { useStore } from '../store';
import { ConnectionEnum } from '../shared/interfaces';

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

  return (
    <ChatBarForm
      isSettings={isSettings}
      onSubmit={(e) => {
        props.sendMessage(e);
        chatTextInput.current.value = '';
      }}
    >
      <ConnectionInfo isConnected={isConnected}>
        {isFailed ? <>connection failed 🙈</> : 'connecting...'}
      </ConnectionInfo>

      <ChatInputWrapper isConnected={isConnected}>
        <SelectionCheckbox
          checked={props.selectionIsChecked}
          hasSelection={hasSelection}
          onClick={(e: any) => {
            props.setSelectionIsChecked(!props.selectionIsChecked);
            chatTextInput.current.focus();
          }}
        >
          {store.selectionCount}
        </SelectionCheckbox>
        <ChatInput hasSelection={hasSelection}>
          {/* <BellIcon
            onClick={() =>
              (store.settings.enableNotificationSound = !store.settings
                .enableNotificationSound)
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 15 16"
            >
              {store.settings.enableNotificationSound ? (
                <path
                  fill={store.settings.color}
                  fillRule="evenodd"
                  d="M11 5v4l1 1H2l1-1V5a4 4 0 018 0zm1 4a2 2 0 002 2H0a2 2 0 002-2V5a5 5 0 0110 0v4zm-5 5l-2-2H4a3 3 0 106 0H9l-2 2z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fill={store.settings.color}
                  fillRule="evenodd"
                  d="M4.998 11.472h9.475v-.882a1.76 1.76 0 01-1.764-1.765v-3.53a5.31 5.31 0 00-.134-1.188l-.88.854c.01.11.014.222.014.334v3.53c0 .617.202 1.187.544 1.647H6.027l-1.029 1zm5.718-8.924a4.295 4.295 0 00-7.597 2.747v3.53c0 .604-.194 1.162-.522 1.617l-1.06 1.03H.354v-.882a1.76 1.76 0 001.765-1.765v-3.53a5.295 5.295 0 019.315-3.445l-.718.698zm-5.009 9.807a1.706 1.706 0 103.413 0h1a2.706 2.706 0 11-5.413 0h1zM0 14.146l14-14 .707.708-14 14L0 14.146z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </BellIcon> */}
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
          {/* <ColorPicker /> */}
          <SendButton color={store.settings.color}>
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
  transition: transform 0.2s;
  transform: translateY(${({ isSettings }) => (isSettings ? 69 : 0)}px);
`;

const ChatInputWrapper = styled.div`
  display: flex;
  transition: transform 0.3s;
  transform: translateY(${({ isConnected }) => (isConnected ? 0 : 69)}px);
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  position: relative;
  z-index: 3;
  transition: width 0.3s;
  background-color: #eceff4;
  border-radius: 10px 10px 0 10px;
  /* width: ${(p) => (p.hasSelection ? '225px' : '100%')}; */
  width: 100%;

  input {
    position: relative;
    background-color: transparent;
    z-index: 2;
    font-size: 11.5px;
    font-weight: 300;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 14px 30px 14px 18px;
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
  div {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    margin-left: 6px;
    &::after {
      content: '';
      width: 7px;
      height: 3px;
      position: absolute;
      border-width: 0px 0px 1px 1px;
      border-color: #fff;
      border-style: solid;
      left: 3px;
      top: 4px;
      opacity: ${({ checked }) => (checked ? 1 : 0)};
      transform: rotate(-45deg);
    }
    &:hover {
      border-color: rgba(255, 255, 255, 1);
    }
  }
`;

export default observer(ChatBar);
