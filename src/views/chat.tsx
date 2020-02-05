import React, { FunctionComponent, useEffect, Fragment } from 'react';
import { store } from 'react-easy-state';
import { Link, Redirect, useHistory } from 'react-router-dom';
import styled from 'styled-components';
// components
import Header from '../components/header';
import Message from '../components/message';
import Chatbar from '../components/chatbar';
//shared
import { IS_PROD, MAX_MESSAGES } from '../shared/constants';
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/socket-provider';
import { state, view } from '../shared/state';
import { SharedIcon } from '../shared/style';
import { sendMainMessage } from '../shared/utils';

interface ChatProps {
  socket: SocketIOClient.Socket;
}

const ChatView: FunctionComponent<ChatProps> = props => {
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
    }
  });

  const sendMessage = (e = null) => {
    if (e) {
      e.preventDefault();
    }
    if (state.roomName) {
      let data = {
        text: chatState.textMessage,
        date: new Date()
      };

      if (state.selection.length > 0) {
        if (chatState.selectionIsChecked) {
          data = {
            ...data,
            ...{
              selection: state.selection
            }
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
          message
        });

        state.addMessage(message);

        chatState.textMessage = '';
        chatState.selectionIsChecked = false;
      }
    }
  };

  // All messages from main
  onmessage = message => {
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
          instanceId = ''
        } = {
          ...pmessage.payload,
          ...(!IS_PROD
            ? {
                secret: 'thisismysecretkey',
                roomName: 'dev'
              }
            : {})
        };

        state.secret = dataSecret;
        state.roomName = dataRoomName;
        state.messages = messages;
        state.instanceId = instanceId;
        state.selection = selection;

        state.persistSettings(settings, props.socket);

        sendMainMessage('ask-for-relaunch-message');
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
    state.scrollToBottom();
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
      {state.status === ConnectionEnum.NONE && <Redirect to="/connecting" />}
      {state.status === ConnectionEnum.CONNECTED && <Redirect to="/" />}
      {state.status === ConnectionEnum.ERROR && (
        <Redirect to="/connection-error" />
      )}

      <Header
        title={
          <div
            style={{
              color: state.settings.color || '#000'
            }}
          >
            {state.settings.name}
          </div>
        }
        right={
          <HeaderRight>
            <SharedIcon onClick={state.toggleMinimizeChat}>
              <div className="icon icon--minus" />
            </SharedIcon>
            <Online onClick={() => history.push('/user-list')}>
              {state.online.length}
            </Online>
          </HeaderRight>
        }
        left={
          <SharedIcon>
            <Link to="/settings">
              <div className="icon icon--adjust"></div>
            </Link>
          </SharedIcon>
        }
      />
      <Chat hasSelection={state.selection.length > 0}>
        <Messages
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
        </Messages>
        <Chatbar
          sendMessage={sendMessage}
          setTextMessage={text => (chatState.textMessage = text)}
          textMessage={chatState.textMessage}
          setSelectionIsChecked={isChecked =>
            (chatState.selectionIsChecked = isChecked)
          }
          selectionIsChecked={chatState.selectionIsChecked}
        />
      </Chat>
    </>
  );
};

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
  display: grid;
  grid-template-rows: auto ${p => (p.hasSelection ? '80px' : '45px')};
  height: calc(100vh - 33px);
  width: 100vw;
`;

const Messages = styled.div`
  margin: 0;
  overflow: auto;
  padding: 15px 15px 0;
`;

const HeaderRight = styled.div`
  display: flex;
`;

const Online = styled.div`
  position: relative;
  padding: 8px 12px 8px 24px;
  align-self: center;
  cursor: pointer;
  font-weight: bold;
  border-left: 1px solid #e9e9e9;
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
