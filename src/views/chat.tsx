import React, { FunctionComponent, useEffect } from 'react';
import { store } from 'react-easy-state';
import { Link, Redirect, useHistory } from 'react-router-dom';
import styled from 'styled-components';
// components
import Header from '../components/header';
import Message from '../components/message';
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/socket-provider';
import { state, view } from '../shared/state';


const IS_PROD = true;

interface Props {
  socket: SocketIOClient.Socket;
}

const ChatView: FunctionComponent<Props> = props => {
  const history = useHistory();
  const chatState = store({
    textMessage: '',
    selection: [],
    addSelection: false
  });

  const sendMessage = e => {
    e.preventDefault();
    if (state.roomName) {
      let data = {
        text: chatState.textMessage
      };

      if (chatState.selection.length > 0) {
        if (chatState.addSelection) {
          data = {
            ...data,
            ...{
              selection: chatState.selection
            }
          };
        }
      }

      if (chatState.textMessage) {
        const message = state.encryptor.encrypt(JSON.stringify(data));

        props.socket.emit('chat message', {
          roomName: state.roomName,
          message
        });

        state.addMessage(message);

        chatState.textMessage = '';
        chatState.addSelection = false;
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
        chatState.selection = hasSelection ? pmessage.payload : [];
        if (!hasSelection) {
          chatState.addSelection = false;
        }
      }

      if (pmessage.type === 'root-data') {
        const {
          roomName: dataRoomName = '',
          secret: dataSecret = '',
          history: messages = [],
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

        state.persistSettings(settings, props.socket);
      }
    }
  };

  useEffect(() => {
    state.scrollToBottom();
  }, []);

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
          <Online onClick={() => history.push('/user-list')}>
            {state.online.length}
          </Online>
        }
        left={
          <Link to="/settings">
            <div className="icon icon--adjust"></div>
          </Link>
        }
      />
      <Chat>
        <Messages
          ref={state.messagesRef}
          onScroll={e => {
            state.disableAutoScroll =
              e.target.scrollHeight -
                (e.target.scrollTop + e.target.clientHeight) >
              0;
          }}
        >
          {state.messages.map((m, i) => (
            <Message key={i} data={m} instanceId={state.instanceId} />
          ))}
        </Messages>
        <Footer onSubmit={e => sendMessage(e)}>
          <ChatInput>
            <input
              type="input"
              className="input"
              value={chatState.textMessage}
              onChange={({ target }: any) =>
                (chatState.textMessage = target.value.substr(0, 1000))
              }
              placeholder="Write something ..."
            />
            <div className="switch">
              <input
                className="switch__toggle"
                disabled={!chatState.selection.length}
                checked={chatState.addSelection}
                onChange={({ target }: any) =>
                  (chatState.addSelection = target.checked)
                }
                type="checkbox"
                id="uniqueId"
              />
              <label className="switch__label" htmlFor="uniqueId"></label>
            </div>
            <button type="submit">
              <div className="icon icon--comment icon--button" />
            </button>
          </ChatInput>
        </Footer>
      </Chat>
    </>
  );
};

const ChatInput = styled.div`
  display: flex;
  height: 44px;
`;

const Footer = styled.form`
  margin: 0;
  border-top: 1px solid #e9e9e9;
  input {
    margin: 7px;
  }
  button {
    border: 0;
    padding: 0 5px;
    margin: 0;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
      .icon {
        cursor: pointer;
        background-color: transparent;
      }
    }
  }
  .switch {
    border-width: 0 1px;
    border-style: solid;
    border-color: #e9e9e9;
    height: 44px;
    &__label {
      top: -16px;
      position: relative;
      cursor: pointer;
    }
  }
`;

const Chat = styled.div`
  display: grid;
  grid-template-rows: auto 45px;
  height: calc(100vh - 33px);
  width: 100vw;
`;

const Messages = styled.div`
  margin: 0;
  overflow: auto;
  padding: 15px 15px 0;
`;

const Online = styled.div`
  position: relative;
  padding: 8px 12px;
  align-self: center;
  cursor: pointer;
  font-weight: bold;
  &::after {
    content: '';
    left: -3px;
    top: 13px;
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background-color: #1bc47d;
  }
`;

export default withSocketContext(view(ChatView));
