import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { state, view } from '../shared/state';
import { sendMainMessage } from '../shared/utils';
import ColorPicker from './ColorPicker';
import { ConnectionEnum } from '../shared/interfaces';

interface ChatProps {
  socket: SocketIOClient.Socket;
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
  init?: (url: string) => void;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
  const isSettings = useRouteMatch('/settings');
  const selection = state.selection.length;
  const hasSelection = Boolean(selection);
  const [show, setShow] = useState(hasSelection);
  const chatTextInput = useRef(null);

  const isFailed = state.status === ConnectionEnum.ERROR;
  const isConnected = state.status === ConnectionEnum.CONNECTED;

  useEffect(() => {
    if (hasSelection) {
      setShow(true);
    }
  }, [hasSelection]);

  const onAnimationEnd = () => {
    if (!hasSelection) {
      setShow(false);
    }
  };

  return (
    <ChatBarForm
      isSettings={isSettings}
      onSubmit={(e) => {
        props.sendMessage(e);
        chatTextInput.current.value = '';
      }}
    >
      {!isConnected && (
        <ConnectionInfo>
          {isFailed ? (
            <>
              connection failed{' '}
              <span onClick={() => props.init(state.url)}>retry</span>
            </>
          ) : (
            'connecting...'
          )}
        </ConnectionInfo>
      )}
      {/* {false ? (
        <SelectionInfo
          hasSelection={hasSelection}
          onAnimationEnd={onAnimationEnd}
        >
          <input
            className="checkbox__box"
            type="checkbox"
            checked={props.selectionIsChecked}
            onChange={(e: any) => {
              props.setSelectionIsChecked(e.target.checked);
              chatTextInput.current.focus();
            }}
            id="selectionIsChecked"
          />
          <label className="checkbox__label" htmlFor="selectionIsChecked">
            Add current selection (<span>{selection}</span> element
            {selection > 1 ? 's' : ''})
          </label>

          <PreviewSelection
            onClick={() =>
              sendMainMessage('focus-nodes', {
                ids: [...state.selection],
              })
            }
          >
            <SharedIcon>
              <div className="icon icon--visible icon--white" />
            </SharedIcon>
          </PreviewSelection>
        </SelectionInfo>
      ) : (
        ''
      )} */}
      {isConnected && (
        <>
          <ChatInput hasSelection={hasSelection}>
            <BellIcon
              onClick={() =>
                (state.settings.enableNotificationSound = !state.settings
                  .enableNotificationSound)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 15 16"
              >
                {state.settings.enableNotificationSound ? (
                  <path
                    fill={state.settings.color}
                    fillRule="evenodd"
                    d="M11 5v4l1 1H2l1-1V5a4 4 0 018 0zm1 4a2 2 0 002 2H0a2 2 0 002-2V5a5 5 0 0110 0v4zm-5 5l-2-2H4a3 3 0 106 0H9l-2 2z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fill={state.settings.color}
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
            <ColorPicker socket={props.socket} />
          </ChatInput>
          <SelectionCheckbox hasSelection={hasSelection}>lol</SelectionCheckbox>
        </>
      )}
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
  transition: transform 0.5s;
  transform: translateY(${({ isSettings }) => (isSettings ? 50 : 0)}px);
`;

const SelectionCheckbox = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  animation-delay: 0.5s;
  transition: all 0.5s;
  opacity: ${(p) => (p.hasSelection ? 1 : 0)};
  color: #fff;
  margin: 7px 14px;
  transform: translateX(${(p) => (p.hasSelection ? 0 : -50)}px);
`;

const BellIcon = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 3;
  left: 10px;
  top: 8px;
  svg {
    width: 15px;
    height: 16px;
  }
`;

const PreviewSelection = styled.div`
  position: relative;
  margin-top: 2px;
  z-index: 5;
  .icon {
    cursor: pointer;
  }

  &:hover {
    .icon {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
`;

const SelectionInfo = styled.div`
  animation: ${(p) => (p.hasSelection ? 'fadeIn' : 'fadeOut')} 0.3s;
  position: ${(p) => (p.hasSelection ? '' : 'absolute')};
  bottom: ${(p) => (p.hasSelection ? '' : '45px')};
  display: flex;
  width: 100%;
  border-top: 0;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  label,
  input {
    cursor: pointer;
  }
  label {
    padding: 10px 0;
    span {
      font-weight: bold;
      margin-right: 3px;
    }
    &::before {
      border-color: #fff;
    }
  }
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  position: relative;
  z-index: 3;
  transition: width 0.3s;
  width: ${(p) => (p.hasSelection ? '200px' : '100%')};
  input {
    position: relative;
    z-index: 2;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 10px 14px 10px 30px;
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

export default view(ChatBar);
