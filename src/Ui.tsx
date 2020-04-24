import React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import io from 'socket.io-client';
// styles
import './assets/css/ui.css';
import './assets/figma-ui/main.min.css';
// components
import Notifications from './components/Notifications';
// shared
import { DEFAULT_SERVER_URL } from './shared/constants';
import { ConnectionEnum } from './shared/interfaces';
import { SocketProvider } from './shared/SocketProvider';
import { state, view } from './shared/state';
import { sendMainMessage } from './shared/utils';
// views
import ChatView from './views/Chat';
import ConnectionView from './views/Connection';
import MinimizedView from './views/Minimized';
import UserListView from './views/UserList';

onmessage = (message) => {
  if (message.data.pluginMessage) {
    const { type, payload } = message.data.pluginMessage;

    // initialize
    if (type === 'ready') {
      sendMainMessage('initialize');
    }

    if (type === 'initialize') {
      init(payload !== '' ? payload : DEFAULT_SERVER_URL);
    }
  }
};

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

const AppWrapper = styled.div`
  overflow: hidden;
`;

const init = (serverUrl) => {
  state.url = serverUrl;

  const socket: SocketIOClient.Socket = io(serverUrl, {
    reconnectionAttempts: 3,
    forceNew: true,
    transports: ['websocket'],
  });

  socket.on('connected', () => {
    state.status = ConnectionEnum.CONNECTED;

    socket.emit('set user', state.settings);
    socket.emit('join room', {
      room: state.roomName,
      settings: state.settings,
    });

    sendMainMessage('ask-for-relaunch-message');
  });

  socket.on('connect_error', () => {
    state.status = ConnectionEnum.ERROR;
  });

  socket.on('reconnect_error', () => {
    state.status = ConnectionEnum.ERROR;
  });

  socket.on('chat message', (data) => {
    state.addMessage(data);
  });

  socket.on('join leave message', (data) => {
    const username = data.user.name || 'Anon';
    let message = 'joins the conversation';

    if (data.type === 'LEAVE') {
      message = 'leaves the conversation';
    }
    state.addNotification(`${username} ${message}`);
  });

  socket.on('online', (data) => (state.online = data));

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
      <AppWrapper>
        <GlobalStyle />
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
              <Route path="/user-list">
                <UserListView />
              </Route>
              <Route path="/">
                <ChatView retry={init} />
              </Route>
            </Switch>
          </Router>
        </SocketProvider>
      </AppWrapper>
    );
  });

  ReactDOM.render(<App />, document.getElementById('app'));
};
