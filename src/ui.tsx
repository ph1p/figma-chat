import React from 'react';
import * as ReactDOM from 'react-dom';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import io from 'socket.io-client';
// styles
import './assets/css/ui.css';
import './assets/figma-ui/main.min.css';
import { ConnectionEnum } from './shared/interfaces';
import { SocketProvider } from './shared/socket-provider';
import { state, view } from './shared/state';
import { sendMainMessage, DEFAULT_SERVER_URL } from './utils';
import ChatView from './views/chat';
import ConnectionView from './views/connection';
// views
import SettingsView from './views/settings';
import UserListView from './views/user-list';

// initialize
sendMainMessage('initialize');
onmessage = message => {
  if (message.data.pluginMessage) {
    const { type, payload } = message.data.pluginMessage;

    if (type === 'initialize') {
      init(payload !== '' ? payload : DEFAULT_SERVER_URL);
    }
  }
};

const init = serverUrl => {
  state.url = serverUrl;

  const socket: SocketIOClient.Socket = io(serverUrl, {
    reconnectionAttempts: 3,
    forceNew: true,
    transports: ['websocket']
  });

  socket.on('connected', () => {
    state.status = ConnectionEnum.CONNECTED;

    socket.emit('join room', state.roomName);
  });

  socket.on('connect_error', () => {
    state.status = ConnectionEnum.ERROR;
  });

  socket.on('reconnect_error', () => {
    state.status = ConnectionEnum.ERROR;
  });

  socket.on('chat message', data => {
    state.addMessage(data);
  });

  socket.on('online', data => (state.online = data));

  sendMainMessage('get-root-data');

  // check focus
  window.addEventListener('focus', () => {
    sendMainMessage('focus', true);
    state.isFocused = true;
  });

  window.addEventListener('blur', () => {
    sendMainMessage('focus', false);
    state.isFocused = false;
  });

  const App = view(() => {
    return (
      <SocketProvider socket={socket}>
        <Router>
          <Switch>
            <Route exact path="/connecting">
              <ConnectionView retry={init} text="connecting..." />
            </Route>
            <Route exact path="/connection-error">
              <ConnectionView retry={init} text="connection error :( " />
            </Route>
            <Route exact path="/">
              <ChatView />
            </Route>
            <Route path="/settings">
              <SettingsView />
            </Route>
            <Route path="/user-list">
              <UserListView />
            </Route>
          </Switch>
        </Router>
      </SocketProvider>
    );
  });

  ReactDOM.render(<App />, document.getElementById('app'));
};
