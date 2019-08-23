import SimpleEncryptor from 'simple-encryptor';
import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import './assets/figma-ui/main.min.css';
import './assets/css/ui.css';

import Settings from './components/settings';
import UserList from './components/user-list';
import Message from './components/message';

import { sendMainMessage } from './utils';

declare function require(path: string): any;
const IS_PROD = true;

enum ConnectionEnum {
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING'
}

enum SelectionStateEnum {
  READY = 'READY',
  NONE = 'NONE',
  LOADING = 'LOADING'
}

// initialize
sendMainMessage('initialize');
onmessage = message => {
  if (message.data.pluginMessage) {
    const { type, payload } = message.data.pluginMessage;

    if (type === 'initialize') {
      payload !== '' ? init(payload) : init();
    }
  }
};

const init = (SERVER_URL = 'https://figma-chat.ph1p.dev/') => {
  const socket = io(SERVER_URL);

  let encryptor;

  const App = function() {
    const [socketId, setSocketId] = useState('');
    const [online, setOnline] = useState([]);
    const [isSettingsView, setSettingsView] = useState(false);
    const [isUserListView, setUserListView] = useState(false);
    const [isMainReady, setMainReady] = useState(false);
    const [selectionStatus, setSelectionStatus] = useState(
      SelectionStateEnum.NONE
    ); // READY, NONE, LOADING

    const [connection, setConnection] = useState(ConnectionEnum.CONNECTING); // CONNECTED, ERROR, CONNECTING
    const [roomName, setRoomName] = useState('');
    const [secret, setSecret] = useState('');
    const [textMessage, setTextMessage] = useState('');
    const [userSettings, setUserSettings] = useState({
      color: '',
      name: ''
    });

    const [messages, setMessages] = useState([]);
    const [selection, setSelection] = useState([]);

    const messagesEndRef = useRef(null);

    // All messages from main
    onmessage = message => {
      const pmessage = message.data.pluginMessage;

      if (pmessage) {
        if (pmessage.type === 'user-settings') {
          setMainReady(true);
          setUserSettings({
            ...userSettings,
            ...pmessage.payload
          });

          socket.emit('set user', pmessage.payload);
        }

        // set selection
        if (pmessage.type === 'selection') {
          setSelection(pmessage.payload);
          setSelectionStatus(
            pmessage.payload.length > 0
              ? SelectionStateEnum.READY
              : SelectionStateEnum.NONE
          );
        }

        if (isMainReady && pmessage.type === 'root-data') {
          const { roomName: dataRoomName = '', secret: dataSecret = '', history = [] } = {
            ...pmessage.payload,
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
          setMessages(JSON.parse(history));
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

        const newMessage = {
          id,
          user,
          message: {
            ...data
          }
        };

        setMessages(messages.concat(newMessage));
        sendMainMessage('add-message-to-history', newMessage);
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

      setSelectionStatus(SelectionStateEnum.LOADING);
      sendMainMessage('get-selection');
    }

    useEffect(() => {
      if (roomName && selectionStatus !== SelectionStateEnum.LOADING) {
        let data = {
          text: textMessage
        };

        if (selectionStatus === SelectionStateEnum.READY) {
          if (confirm('Include current selection?')) {
            data = {
              ...data,
              ...{
                selection
              }
            };
          }
        } else if (selectionStatus === SelectionStateEnum.NONE) {
          // nothing selected
        }

        if (textMessage) {
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
      }
    }, [selectionStatus]);

    useEffect(() => {
      if (isMainReady && !roomName) {
        sendMainMessage('get-root-data');
      } else {
        sendMainMessage('get-user-settings');
      }

      socket.on('connect_error', () => {
        setConnection(ConnectionEnum.ERROR);
      });

      socket.on('connected', user => {
        setConnection(ConnectionEnum.CONNECTED);
        setSocketId(user.id);
      });

      socket.on('online', data => setOnline(data));
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
      if (isMainReady && connection === ConnectionEnum.CONNECTED && roomName) {
        socket.emit('join room', roomName);
      }
    }, [isMainReady, roomName, connection]);

    if (isSettingsView) {
      return (
        <Settings
          setSettingsView={setSettingsView}
          settings={userSettings}
          url={SERVER_URL}
        />
      );
    }

    if (isUserListView) {
      return <UserList setUserListView={setUserListView} online={online} />;
    }

    if (isSettingsView) {
      return (
        <Settings
          setSettingsView={setSettingsView}
          settings={userSettings}
          url={SERVER_URL}
        />
      );
    }

    if (connection === ConnectionEnum.CONNECTING) {
      return (
        <div className="connection">
          <div>connecting...</div>
        </div>
      );
    }

    if (connection === ConnectionEnum.ERROR) {
      return (
        <div className="connection">
          <div>
            connection error :( <br />
            <br />
            <button
              className="button button--secondary"
              onClick={() => setConnection(ConnectionEnum.CONNECTING)}
            >
              retry
            </button>
            <button
              className="button button--secondary"
              style={{ marginLeft: 10 }}
              onClick={() => setSettingsView(true)}
            >
              settings
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
                <span style={{ color: userSettings.color || '#000' }}>
                  {userSettings.name && <strong>{userSettings.name}</strong>}
                </span>

                <span
                  className="user-online"
                  onClick={() => setUserListView(true)}
                >
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
};
