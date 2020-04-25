import React, { FunctionComponent, useEffect, Fragment, useState } from 'react';
import { store } from 'react-easy-state';
import { Redirect, useHistory, useRouteMatch, Route } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
// components
import SettingsView from '../views/Settings';
import Message from '../components/Message';
import Chatbar from '../components/Chatbar';
//shared
import { IS_PROD, MAX_MESSAGES } from '../shared/constants';
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/SocketProvider';
import { state, view } from '../shared/state';
import { SharedIcon } from '../shared/style';
import { sendMainMessage } from '../shared/utils';

interface ChatProps {
  socket: SocketIOClient.Socket;
  init?: (url: string) => void;
}

const ChatView: FunctionComponent<ChatProps> = (props) => {
  const isConnected = state.status === ConnectionEnum.CONNECTED;

  const [animationEnabled, enableAnimation] = useState(false);
  const [containerIsHidden, setContainerIsHidden] = useState(false);
  const isSettings = useRouteMatch('/settings');

  const history = useHistory();
  const chatState = store({
    textMessage: '',
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    get hideMoreButton() {
      return (
        chatState.messagesToShow >= state.messages.length ||
        chatState.filteredMessages.length >= state.messages.length
      );
    },
    get filteredMessages() {
      return state.messages.slice(-chatState.messagesToShow);
    },
  });

  const sendMessage = (e = null) => {
    if (e) {
      e.preventDefault();
    }
    if (state.roomName) {
      let data = {
        text: chatState.textMessage,
        date: new Date(),
      };

      if (state.selection.length > 0) {
        if (chatState.selectionIsChecked) {
          data = {
            ...data,
            ...{
              selection: state.selection,
            },
          };
        }
      }

      if (!chatState.textMessage && !chatState.selectionIsChecked) {
        state.addNotification(
          'Please enter a text or select something',
          'error'
        );
      } else {
        const message = state.encryptor.encrypt(JSON.stringify(data));

        props.socket.emit('chat message', {
          roomName: state.roomName,
          message,
        });

        state.addMessage(message);

        chatState.textMessage = '';
        chatState.selectionIsChecked = false;
      }
    }
  };

  // All messages from main
  onmessage = (message) => {
    const pmessage = message.data.pluginMessage;

    if (pmessage) {
      // set selection
      if (pmessage.type === 'selection') {
        const hasSelection = pmessage.payload.length > 0;
        state.selection = hasSelection ? pmessage.payload : [];

        if (!hasSelection) {
          chatState.selectionIsChecked = false;
        }
      }

      if (pmessage.type === 'root-data') {
        const {
          roomName: dataRoomName = '',
          secret: dataSecret = '',
          history: messages = [],
          selection = [],
          settings = {},
          instanceId = '',
        } = {
          ...pmessage.payload,
          ...(!IS_PROD
            ? {
                secret: 'thisismysecretkey',
                roomName: 'dev',
              }
            : {}),
        };

        state.secret = dataSecret;
        state.roomName = dataRoomName;
        state.messages = messages;
        state.instanceId = instanceId;
        state.selection = selection;

        state.persistSettings(settings, props.socket);
      }

      if (pmessage.type === 'relaunch-message') {
        chatState.selectionIsChecked = true;
        state.selection = pmessage.payload.selection || [];

        if (state.selection.length) {
          sendMessage();
          sendMainMessage('notify', 'Selection sent successfully');
        }
      }
    }
  };

  useEffect(() => {
    setTimeout(state.scrollToBottom, 10);
  }, []);

  const showMore = () => {
    if (
      chatState.filteredMessages.length + MAX_MESSAGES >=
      state.messages.length
    ) {
      chatState.messagesToShow = state.messages.length;
    } else {
      chatState.messagesToShow += MAX_MESSAGES;
    }
  };

  return (
    <>
      <Chat
        color={state.settings.color}
        hasSelection={state.selection.length > 0}
      >
        {isConnected && (
          <FloatingButtonRight isSettings={isSettings}>
            <Online onClick={() => history.push('/user-list')}>
              {state.online.length}
            </Online>
            <SharedIcon onClick={state.toggleMinimizeChat}>
              <div className="icon icon--minus icon--white" />
            </SharedIcon>
          </FloatingButtonRight>
        )}

        <Messages
          onAnimationEnd={() => setContainerIsHidden(!containerIsHidden)}
          animationEnabled={animationEnabled}
          isSettings={isSettings}
          ref={state.messagesRef}
          onWheel={() => {
            const { current } = state.messagesRef;

            state.disableAutoScroll =
              current.scrollHeight -
                (current.scrollTop + current.clientHeight) >
              0;
          }}
        >
          {!chatState.hideMoreButton && (
            <MoreButton className="button button--secondary" onClick={showMore}>
              show more
            </MoreButton>
          )}

          {chatState.filteredMessages.map((m, i) => (
            <Fragment key={i}>
              <Message data={m} instanceId={state.instanceId} />
              {(i + 1) % MAX_MESSAGES === 0 &&
              i + 1 !== chatState.filteredMessages.length ? (
                <MessageSeperator />
              ) : (
                ''
              )}
            </Fragment>
          ))}

          <SettingsArrow
            isSettings={isSettings}
            onClick={() => {
              enableAnimation(true);
              history.push(isSettings ? '/' : '/settings');
            }}
          >
            {isSettings ? (
              <svg
                width="11"
                height="7"
                viewBox="0 0 11 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.99985 1L5.49985 5.5L0.999849 1" stroke="black" />
              </svg>
            ) : (
              <svg
                width="11"
                height="6"
                viewBox="0 0 11 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 5.5L5.5 1L10 5.5" stroke="black" />
              </svg>
            )}
          </SettingsArrow>
        </Messages>

        {(isSettings || (!isSettings && !containerIsHidden)) && (
          <SettingsView init={props.init} />
        )}

        <Chatbar
          init={props.init}
          socket={props.socket}
          sendMessage={sendMessage}
          setTextMessage={(text) => (chatState.textMessage = text)}
          textMessage={chatState.textMessage}
          setSelectionIsChecked={(isChecked) =>
            (chatState.selectionIsChecked = isChecked)
          }
          selectionIsChecked={chatState.selectionIsChecked}
        />
      </Chat>
    </>
  );
};

const slideUpMessages = keyframes`
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-318px);
  }
`;
const slideDownMessages = keyframes`
  from {
    transform: translateY(-318px);
  }
  to {
    transform: translateY(0px);
  }
`;

const FloatingButtonRight = styled.div`
  position: fixed;
  z-index: 9;
  right: 10px;
  top: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  border-radius: 5px;
  transition: transform 0.5s;
  transform: translateX(${({ isSettings }) => (isSettings ? 150 : 0)}px);
`;

const SettingsArrow = styled.div`
  position: sticky;
  left: 0;
  bottom: 0;
  padding-top: 5px;
  padding-bottom: 17px;
  cursor: pointer;
  transition: rotate 0.3s;
  width: 100%;
  height: 10px;
  text-align: center;
`;

const MoreButton = styled.button`
  padding: 0 7px;
  height: 20px;
  margin: 0 0 15px;
  width: 100%;
  cursor: pointer;
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
  &:active {
    padding: 0 7px;
  }
`;

const MessageSeperator = styled.div`
  border-width: 1px 0 0 0;
  border-color: #ececec;
  border-style: dotted;
  margin: -5px 0 10px;
`;

const Chat = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: ${({ color }) => color};
`;

const Messages = styled.div`
  position: relative;
  z-index: 2;
  margin: 0;
  overflow: ${({ isSettings }) => (isSettings ? 'hidden' : 'auto')};
  padding: 15px 15px 0;
  background-color: #fff;
  border-radius: 0 0 15px 15px;
  transition: transform 0.4s;
  height: 371px;
  animation: ${({ isSettings }) =>
      isSettings ? slideUpMessages : slideDownMessages}
    ease-in-out forwards;
  animation-duration: ${({ animationEnabled }) =>
    animationEnabled ? 0.5 : 0}s;
`;

const Online = styled.div`
  position: relative;
  padding: 8px 0 8px 24px;
  align-self: center;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  &::after {
    content: '';
    left: 10px;
    top: 13px;
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background-color: #1bc47d;
  }
`;

export default withSocketContext(view(ChatView));
