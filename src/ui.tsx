import React from 'react';
import * as ReactDOM from 'react-dom';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import io from 'socket.io-client';
// styles
import './assets/css/ui.css';
import './assets/figma-ui/main.min.css';
// components
import Notifications from './components/notifications';
// shared
import { DEFAULT_SERVER_URL } from './shared/constants';
import { ConnectionEnum } from './shared/interfaces';
import { SocketProvider } from './shared/socket-provider';
import { state, view } from './shared/state';
import { sendMainMessage } from './shared/utils';
// views
import ChatView from './views/chat';
import ConnectionView from './views/connection';
import MinimizedView from './views/minimized';
import SettingsView from './views/settings';
import UserListView from './views/user-list';

// wait 100ms to initialize, to prevent race conditions
setTimeout(() => sendMainMessage('initialize'), 100);

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
    socket.emit('set user', state.settings);
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

  socket.on('join leave message', data => {
    const username = data.user.name || 'Anon';
    let message = 'joins the conversation';

    if (data.type === 'LEAVE') {
      message = 'leaves the conversation';
    }
    state.addNotification(`${username} ${message}`);
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
      <>
        <Notifications />

        <SocketProvider socket={socket}>
          <Router>
            {state.isMinimized && <Redirect to="/minimized" />}
            <Switch>
              <Route exact path="/minimized">
                <MinimizedView />
              </Route>
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
                <SettingsView init={init} />
              </Route>
              <Route path="/user-list">
                <UserListView />
              </Route>
            </Switch>
          </Router>
        </SocketProvider>
      </>
    );
  });

  ReactDOM.render(<App />, document.getElementById('app'));
};
