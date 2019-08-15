import SimpleEncryptor from 'simple-encryptor';
import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import './figma-ui/main.min.css';
import './ui.css';

import { sendMainMessage } from './helpers';

declare function require(path: string): any;

const colors = {
  blue: '#18A0FB',
  purple: '#7B61FF',
  hotPink: '#FF00FF',
  green: '#1BC47D',
  red: '#F24822',
  yellow: '#FFEB00'
};

const IS_PROD = true;

const socket = io(
  IS_PROD ? 'https://figma-chat.ph1p.dev/' : 'http://127.0.0.1:3000'
);

const Message = ({ data }) => {
  return (
    <div className={`message ${data.id === 'me' ? 'me' : 'blue'}`}>
      {data.message.selection ? (
        <span
          onClick={() =>
            sendMainMessage('focus-nodes', {
              ids: data.message.selection
            })
          }
        >
          {data.message.text}
          <p className="selection">Focus selection</p>
        </span>
      ) : (
        <span>{data.message.text}</span>
      )}
    </div>
  );
};

let encryptor;

const App = function() {
  const [isMainReady, setMainReady] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState('NONE'); // READY, NONE, LOADING

  const [roomName, setRoomName] = useState('');
  const [secret, setSecret] = useState('');
  const [textMessage, setTextMessage] = useState('');

  const [messages, setMessages] = useState([]);
  const [selection, setSelection] = useState([]);

  const messagesEndRef = useRef(null);

  /**
   * Append message
   * @param param0
   */
  function appendMessage({ message, user = {}, id }) {
    const decryptedMessage = encryptor.decrypt(message);

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);

      setMessages(
        messages.concat({
          id,
          message: {
            ...data
          }
        })
      );
    } catch (e) {}
  }

  /**
   * Send message
   * @param e
   */
  function sendMessage(e = null) {
    if (e) {
      e.preventDefault();
    }

    setSelectionStatus('LOADING');
    sendMainMessage('get-selection');
  }

  useEffect(() => {
    if (roomName && selectionStatus !== 'LOADING') {
      let data = {
        text: textMessage
      };

      if (selectionStatus === 'READY') {
        if (confirm('Include current selection?')) {
          data = {
            ...data,
            ...{
              selection
            }
          };
        }
      } else if (selectionStatus === 'NONE') {
        // nothing selected
      }

      const message = encryptor.encrypt(JSON.stringify(data));

      socket.emit('chat message', {
        roomName,
        message
      });

      appendMessage({
        id: 'me',
        message
      });

      setTextMessage('');
    }
  }, [selectionStatus]);

  useEffect(() => {
    if (isMainReady && !roomName) {
      sendMainMessage('get-root-data');
    }

    socket.on('chat message', appendMessage);
    socket.on('user reconnected', () => {
      sendMainMessage('get-root-data');
    });

    // scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }

    return () => {
      socket.removeAllListeners();
    };
  }, [messages, isMainReady]);

  // join room
  useEffect(() => {
    if (isMainReady && roomName) {
      socket.emit('join room', roomName);
    }
  }, [roomName]);

  // All messages from main
  onmessage = message => {
    const pmessage = message.data.pluginMessage;

    if (pmessage) {
      if (pmessage.type === 'main-ready') {
        setMainReady(true);
      }

      // set selection
      if (pmessage.type === 'selection') {
        setSelection(pmessage.selection);
        setSelectionStatus(pmessage.selection.length > 0 ? 'READY' : 'NONE');
      }

      if (isMainReady && pmessage.type === 'root-data') {
        const { roomName: dataRoomName = '', secret: dataSecret = '' } = {
          ...pmessage,
          ...(!IS_PROD
            ? {
                secret: 'thisismysecretkey',
                roomName: 'dev'
              }
            : {})
        };

        encryptor = SimpleEncryptor(dataSecret);

        setSecret(dataSecret);
        setRoomName(dataRoomName);
      }
    }
  };

  return (
    <div className="main">
      {roomName ? (
        <div className="chat">
          <div className="room-name">
            Room: {roomName} - {secret}
          </div>
          <div className="messages" ref={messagesEndRef}>
            {messages.map((m, i) => (
              <Message key={i} data={m} />
            ))}
          </div>
          <form className="footer" onSubmit={e => sendMessage(e)}>
            <input
              type="input"
              className="input"
              value={textMessage}
              onChange={e => setTextMessage(e.target.value)}
              placeholder="Write something ..."
            />

            <button type="submit">
              <div className="icon icon--play icon--button" />
            </button>
          </form>
        </div>
      ) : (
        <div>connecting...</div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
