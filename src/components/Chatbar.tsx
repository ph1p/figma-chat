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
  const chatTextInput = useRef(null);

  const isFailed = store.status === ConnectionEnum.ERROR;
  const isConnected = store.status === ConnectionEnum.CONNECTED;

  useEffect(
    () => autorun(() => setHasSelection(Boolean(store.selectionCount))),
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
        <ChatInput hasSelection={hasSelection}>
          <BellIcon
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
          </BellIcon>
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
          <ColorPicker />
        </ChatInput>
        <SelectionCheckbox
          checked={props.selectionIsChecked}
          hasSelection={hasSelection}
          onClick={(e: any) => {
            props.setSelectionIsChecked(!props.selectionIsChecked);
            chatTextInput.current.focus();
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 .5V3h4V.5h1V3h2.5v1H9v4h2.5v1H9v2.5H8V9H4v2.5H3V9H.5V8H3V4H.5V3H3V.5h1zM8 8V4H4v4h4z"
              fill="#fff"
            />
          </svg>
          <div></div>
        </SelectionCheckbox>
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
  color: #fff;
  font-weight: bold;
  transition: transform 0.2s;
  transform: translateY(${({ isConnected }) => (isConnected ? 50 : 0)}px);
  span {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ChatBarForm = styled.form`
  position: absolute;
  z-index: 3;
  height: 37px;
  padding-top: 7px;
  right: 14px;
  left: 14px;
  bottom: 7px;
  margin: 0;
  transition: transform 0.2s;
  transform: translateY(${({ isSettings }) => (isSettings ? 50 : 0)}px);
`;

const BellIcon = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 3;
  left: 9px;
  top: 8px;
  svg {
    width: 15px;
    height: 16px;
  }
`;

const ChatInputWrapper = styled.div`
  transition: transform 0.3s;
  transform: translateY(${({ isConnected }) => (isConnected ? 0 : 50)}px);
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  position: relative;
  z-index: 3;
  transition: width 0.3s;
  width: ${(p) => (p.hasSelection ? '225px' : '100%')};
  input {
    position: relative;
    z-index: 2;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 10px 30px 10px 30px;
    height: 30px;
    outline: none;
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

const SelectionCheckbox = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  animation-delay: 0.2s;
  transition: all 0.2s;
  color: #fff;
  margin: 0;
  transform: translateX(${(p) => (p.hasSelection ? 0 : -50)}px);
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
  div {
    position: relative;
    width: 16px;
    height: 16px;
    border: 1px solid
      rgba(255, 255, 255, ${({ checked }) => (checked ? 1 : 0.5)});
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
