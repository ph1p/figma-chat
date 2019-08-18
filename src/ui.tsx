import SimpleEncryptor from 'simple-encryptor';
import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import './assets/figma-ui/main.min.css';
import './assets/css/ui.css';

import Settings from './components/settings';
import Message from './components/message';

import { sendMainMessage } from './helpers';

declare function require(path: string): any;

const IS_PROD = true;
const SERVER_URL = IS_PROD
  ? 'https://figma-chat.ph1p.dev/'
  : 'http://127.0.0.1:3000';

const socket = io(SERVER_URL);

let encryptor;

const App = function() {
  const [socketId, setSocketId] = useState('');
  const [online, setOnline] = useState([]);
  const [isSettingsView, setSettingsView] = useState(false);
  const [isMainReady, setMainReady] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState('NONE'); // READY, NONE, LOADING

  const [connection, setConnection] = useState('CONNECTING'); // CONNECTED, ERROR, CONNECTING
  const [roomName, setRoomName] = useState('');
  const [secret, setSecret] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [settings, setSettings] = useState({
    url: SERVER_URL,
    user: {
      color: '',
      name: ''
    }
  });

  const [messages, setMessages] = useState([]);
  const [selection, setSelection] = useState([]);

  const messagesEndRef = useRef(null);

  // All messages from main
  onmessage = message => {
    const pmessage = message.data.pluginMessage;

    if (pmessage) {
      if (pmessage.type === 'settings') {
        setMainReady(true);
        setSettings({
          ...pmessage.settings,
          user: {
            ...pmessage.settings.user
          }
        });

        socket.emit('set user', pmessage.settings.user);
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

  /**
   * Append message
   * @param data
   */
  function appendMessage({ message, user = {}, id }) {
    const decryptedMessage = encryptor.decrypt(message);

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);

      setMessages(
        messages.concat({
          id,
          user,
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
    } else {
      sendMainMessage('get-settings');
    }

    socket.on('connect_error', () => {
      setConnection('ERROR');
    });

    socket.on('connected', user => {
      setConnection('CONNECTED');
      setSocketId(user.id);
    });

    socket.on('online', setOnline);
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
  }, [messages, isMainReady, connection]);

  // join room
  useEffect(() => {
    if (isMainReady && connection === 'CONNECTED' && roomName) {
      socket.emit('join room', roomName);
    }
  }, [roomName, connection]);

  if (isSettingsView) {
    return <Settings setSettingsView={setSettingsView} settings={settings} />;
  }

  if (connection == 'CONNECTING') {
    return (
      <div className="connection">
        <div>connecting...</div>
      </div>
    );
  }

  if (connection == 'ERROR') {
    return (
      <div className="connection">
        <div>
          connection error :( <br />
          <br />
          <button
            className="button button--secondary"
            onClick={() => setConnection('CONNECTING')}
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="chat">
        <div className="header">
          <div className="onboarding-tip">
            <div
              className="onboarding-tip__icon"
              onClick={() => setSettingsView(true)}
            >
              <div className="icon icon--adjust icon--button" />
            </div>
            <div className="onboarding-tip__msg">
              <span style={{ color: settings.user.color || '#000' }}>
                {settings.user.name && <strong>{settings.user.name}</strong>}
              </span>

              <span>
                online: <strong>{online.length}</strong>
              </span>
            </div>
          </div>
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
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
