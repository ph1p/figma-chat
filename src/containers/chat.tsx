import React, { FunctionComponent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { store } from 'react-easy-state';
import styled from 'styled-components';
import { view, state } from '../shared/state';

// components
import Header from '../components/header';
import Message from '../components/message';

const IS_PROD = true;

const ChatScreen: FunctionComponent = () => {
  const chatState = store({
    textMessage: '',
    selection: []
  });

  const messagesEndRef = useRef(null);

  const sendMessage = e => {
    e.preventDefault();
    if (state.roomName) {
      let data = {
        text: chatState.textMessage
      };

      if (chatState.selection.length > 0) {
        if (window.confirm('Include current selection?')) {
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

        // socket.emit('chat message', {
        //   roomName: state.roomName,
        //   message
        // });

        state.addMessage(message);

        chatState.textMessage = '';
      }
    }
  };

  // All messages from main
  onmessage = message => {
    const pmessage = message.data.pluginMessage;

    if (pmessage) {
      // set selection
      if (pmessage.type === 'selection') {
        chatState.selection =
          pmessage.payload.length > 0 ? pmessage.payload : [];
      }

      console.log(pmessage.type);

      if (pmessage.type === 'root-data') {
        const {
          roomName: dataRoomName = '',
          secret: dataSecret = '',
          history = [],
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

        state.settings = {
          ...state.settings,
          ...settings
        };
        state.secret = dataSecret;
        state.roomName = dataRoomName;
        state.messages = history;
        state.instanceId = instanceId;
      }
    }
  };

  return (
    <>
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
        right={<div>2</div>}
        left={
          <Link to="/settings">
            <div className="icon icon--adjust"></div>
          </Link>
        }
      />
      <Chat>
        {!state.isMinimized ? (
          <>
            <div className="messages" ref={messagesEndRef}>
              {state.messages.map((m, i) => (
                <Message key={i} data={m} instanceId={state.instanceId} />
              ))}
            </div>
            <form className="footer" onSubmit={e => sendMessage(e)}>
              <input
                type="input"
                className="input"
                value={chatState.textMessage}
                onChange={({ target }: any) =>
                  (chatState.textMessage = target.value.substr(0, 1000))
                }
                placeholder="Write something ..."
              />

              <button type="submit">
                <div className="icon icon--play icon--button" />
              </button>
            </form>
          </>
        ) : (
          <div className="info-paragraph">
            Click on "+" to show the Chat again.
          </div>
        )}
      </Chat>
    </>
  );
};

const Chat = styled.div`
  display: grid;
  grid-template-rows: auto 45px;
  height: calc(100% - 33px);

  .messages {
    margin: 0;
    overflow: auto;
    padding: 15px 15px 0;
  }

  .footer {
    display: grid;
    grid-template-columns: 1fr 32px;
    grid-gap: 10px;
    margin: 0;
    padding: 6px;
    border-top: 1px solid #e9e9e9;
    button {
      border: 0;
      padding: 0;
      margin: 0;
      background-color: transparent;
      outline: none;
    }
  }
`;

export default view(ChatScreen);
