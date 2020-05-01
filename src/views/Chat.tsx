import React, {
  FunctionComponent,
  useEffect,
  useState,
  createRef,
} from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
// components
import SettingsView from '../views/Settings';
import Message from '../components/Message';
import Chatbar from '../components/Chatbar';
//shared
import { IS_PROD, MAX_MESSAGES } from '../shared/constants';
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/SocketProvider';
import { sendMainMessage } from '../shared/utils';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
// store
import { observer, useLocalStore } from 'mobx-react';
import { useStore } from '../store';
import { toJS } from 'mobx';

interface ChatProps {
  socket: SocketIOClient.Socket;
}

const ChatView: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();
  const isConnected = store.status === ConnectionEnum.CONNECTED;

  const [animationEnabled, enableAnimation] = useState(false);
  const [containerIsHidden, setContainerIsHidden] = useState(false);
  const isSettings = useRouteMatch('/settings');

  const history = useHistory();
  const chatState = useLocalStore(() => ({
    textMessage: '',
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    get hideMoreButton() {
      return (
        chatState.messagesToShow >= store.messages.length ||
        chatState.filteredMessages.length >= store.messages.length
      );
    },
    get filteredMessages() {
      return [...store.messages].slice(-chatState.messagesToShow);
    },
  }));

  const sendMessage = (e = null) => {
    if (e) {
      e.preventDefault();
    }
    if (store.roomName) {
      let data = {
        text: chatState.textMessage,
        date: new Date(),
      };

      if (store.selectionCount > 0) {
        if (chatState.selectionIsChecked) {
          data = {
            ...data,
            ...{
              selection: store.selection,
            },
          };
        }
      }

      if (!chatState.textMessage && !chatState.selectionIsChecked) {
        store.addNotification(
          'Please enter a text or select something',
          'error'
        );
      } else {
        const message = store.encryptor.encrypt(JSON.stringify(data));

        props.socket.emit('chat message', {
          roomName: store.roomName,
          message,
        });

        store.addMessage(message);

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
        const hasSelection =
          pmessage.payload?.length > 0 || pmessage.payload?.nodes?.length > 0;

        store.selection = hasSelection ? pmessage.payload : {};

        if (!hasSelection) {
          chatState.selectionIsChecked = false;
        }
      }

      if (pmessage.type === 'root-data') {
        const {
          roomName: dataRoomName = '',
          secret: dataSecret = '',
          history: messages = [],
          selection = {
            page: '',
            nodes: [],
          },
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

        store.secret = dataSecret;
        store.roomName = dataRoomName;
        store.messages = messages;
        store.instanceId = instanceId;
        store.selection = selection;

        store.persistSettings(settings, props.socket);
      }

      if (pmessage.type === 'relaunch-message') {
        chatState.selectionIsChecked = true;

        store.selection = pmessage.payload.selection || {};

        if (store.selectionCount) {
          sendMessage();
          sendMainMessage('notify', 'Selection sent successfully');
        }
      }
    }
  };

  useEffect(() => {
    store.scrollToBottom();
  }, [store.messages]);

  const showMore = () => {
    if (
      chatState.filteredMessages.length + MAX_MESSAGES >=
      store.messages.length
    ) {
      chatState.messagesToShow = store.messages.length;
    } else {
      chatState.messagesToShow += MAX_MESSAGES;
    }
  };

  return (
    <>
      <Chat
        color={store.settings.color}
        hasSelection={store.selectionCount > 0}
      >
        {isConnected && (
          <FloatingButtonRight isSettings={isSettings}>
            <Online onClick={() => history.push('/user-list')}>
              {store.online.length}
            </Online>
            <Minimize onClick={() => store.toggleMinimizeChat()} />
          </FloatingButtonRight>
        )}

        {!chatState.hideMoreButton && (
          <MoreButton isSettings={isSettings} onClick={showMore}>
            more
          </MoreButton>
        )}
        <MessagesContainer
          isSettings={isSettings}
          animationEnabled={animationEnabled}
          onAnimationEnd={() => setContainerIsHidden(!containerIsHidden)}
        >
          <Messages
            animationEnabled={animationEnabled}
            isSettings={isSettings}
            ref={store.messagesRef}
            onWheel={() => {
              const { current } = toJS(store.messagesRef);

              store.disableAutoScroll =
                current.scrollHeight -
                  (current.scrollTop + current.clientHeight) >
                0;
            }}
          >
            <TransitionGroup>
              {chatState.filteredMessages.map((m, i) => (
                <CSSTransition
                  key={m.message.date}
                  timeout={400}
                  classNames={`message-${
                    m.id === store.instanceId ? 'self' : 'other'
                  }`}
                >
                  <>
                    <Message data={m} instanceId={store.instanceId} />
                    {(i + 1) % MAX_MESSAGES === 0 &&
                    i + 1 !== chatState.filteredMessages.length ? (
                      <MessageSeperator />
                    ) : (
                      ''
                    )}
                  </>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </Messages>
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
        </MessagesContainer>

        {(isSettings || (!isSettings && !containerIsHidden)) && (
          <SettingsView />
        )}

        <Chatbar
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
  transition: transform 0.2s;
  transform: translateX(${({ isSettings }) => (isSettings ? 150 : 0)}px);
`;

const SettingsArrow = styled.div`
  position: absolute;
  bottom: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: pointer;
  transition: rotate 0.3s;
  width: 100%;
  text-align: center;
`;

const MoreButton = styled.div`
  position: fixed;
  z-index: 9;
  left: 10px;
  top: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  color: #fff;
  transition: transform 0.2s;
  transform: translateX(${({ isSettings }) => (isSettings ? -150 : 0)}px);
  padding: 5px 15px;
  line-height: 14px;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 18);
  }
`;

const MessageSeperator = styled.div`
  border-width: 1px 0 0 0;
  border-color: #ececec;
  border-style: dotted;
  margin: 5px 0 10px;
`;

const Chat = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: ${({ color }) => color};
`;

const MessagesContainer = styled.div`
  /* display: grid;
  grid-template-rows: auto 26px; */
  position: relative;
  z-index: 2;
  margin: 0;
  background-color: #fff;
  border-radius: 0 0 15px 15px;
  transition: transform 0.4s;
  height: 371px;
  animation: ${({ isSettings }) =>
      isSettings ? slideUpMessages : slideDownMessages}
    ease-in-out forwards;
  animation-duration: ${({ animationEnabled }) =>
    animationEnabled ? 0.2 : 0}s;
`;

const Messages = styled.div`
  padding: 55px 10px 0;
  overflow: ${({ isSettings }) => (isSettings ? 'hidden' : 'auto')};
  overflow-x: hidden;
  align-self: end;
  height: 100%;
  > div {
    &:last-child {
      margin-bottom: 22px;
    }
  }
  .message {
    &-self {
      &-enter {
        opacity: 0;
        transform: translateX(60px);
      }
      &-enter-active {
        opacity: 1;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(0px);
      }
      &-exit {
        opacity: 1;
        transform: translateX(0px);
      }
      &-exit-active {
        opacity: 0;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(60px);
      }
    }
    &-other {
      &-enter {
        opacity: 0;
        transform: translateX(-60px);
      }
      &-enter-active {
        opacity: 1;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(0px);
      }
      &-exit {
        opacity: 1;
        transform: translateX(0px);
      }
      &-exit-active {
        opacity: 0;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(-60px);
      }
    }
  }
`;

const Online = styled.div`
  position: relative;
  padding: 4px 5px 5px 20px;
  align-self: center;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  &::after {
    content: '';
    left: 8px;
    top: 10px;
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background-color: #1bc47d;
  }
`;

const Minimize = styled.div`
  position: relative;
  padding: 10px 0;
  width: 24px;
  align-self: center;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  &::after {
    content: '';
    left: 6px;
    top: 9px;
    position: absolute;
    width: 11px;
    height: 1px;
    background-color: #fff;
  }
`;

export default withSocketContext(observer(ChatView));
