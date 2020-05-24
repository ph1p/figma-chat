import { observer } from 'mobx-react';
import 'mobx-react-lite/batchingForReactDom';
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import io from 'socket.io-client';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
// styles
import './assets/css/ui.css';
import './assets/figma-ui/main.min.css';
// components
import Notifications from './components/Notifications';
import { SocketProvider } from './shared/SocketProvider';
// shared
import { ConnectionEnum } from './shared/interfaces';
import { sendMainMessage } from './shared/utils';
// views
import ChatView from './views/Chat';
import MinimizedView from './views/Minimized';
import SettingsView from './views/Settings';
import UserListView from './views/UserList';

import { reaction } from 'mobx';
import { useStore, StoreProvider } from './store';
import theme from './shared/theme';

onmessage = (message) => {
  if (message.data.pluginMessage) {
    const { type } = message.data.pluginMessage;

    // initialize
    if (type === 'ready') {
      sendMainMessage('initialize');
    }

    if (type === 'initialize') {
      init();
    }
  }
};

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
    background-color: ${p => p.theme.backgroundColor};
  }
`;

const AppWrapper = styled.div`
  overflow: hidden;
`;

const init = () => {
  const App = observer(() => {
    const store = useStore();
    const [socket, setSocket] = useState<SocketIOClient.Socket>(undefined);

    function onFocus() {
      sendMainMessage('focus', false);

      store.isFocused = false;
    }
    function onFocusOut() {
      sendMainMessage('focus', false);
      store.isFocused = false;
    }

    function initSocketConnection(url: string) {
      store.status = ConnectionEnum.NONE;

      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }

      setSocket(
        io(url, {
          reconnectionAttempts: 3,
          forceNew: true,
          transports: ['websocket'],
        })
      );
    }

    useEffect(() => {
      if (socket && store.status === ConnectionEnum.NONE) {
        sendMainMessage('get-root-data');

        socket.on('connected', () => {
          store.status = ConnectionEnum.CONNECTED;

          socket.emit('set user', store.settings);
          socket.emit('join room', {
            room: store.roomName,
            settings: store.settings,
          });

          sendMainMessage('ask-for-relaunch-message');
        });

        socket.on('connect_error', () => {
          store.status = ConnectionEnum.ERROR;
        });

        socket.on('reconnect_error', () => {
          store.status = ConnectionEnum.ERROR;
        });

        socket.on('chat message', (data) => {
          store.addMessage(data);
        });

        socket.on('join leave message', (data) => {
          const username = data.user.name || 'Anon';
          let message = 'joins the conversation';

          if (data.type === 'LEAVE') {
            message = 'leaves the conversation';
          }
          store.addNotification(`${username} ${message}`);
        });

        socket.on('online', (data) => (store.online = data));
      }

      return () => {
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
      };
    }, [socket]);

    useEffect(() => {
      initSocketConnection(store.settings.url);

      const serverUrlDisposer = reaction(
        () => store.settings.url,
        () => {
          initSocketConnection(store.settings.url);
        }
      );

      // check focus
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onFocusOut);

      return () => {
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('blur', onFocusOut);
        serverUrlDisposer();
      };
    }, []);

    return (
      <ThemeProvider theme={theme(store.settings.isDarkTheme)}>
        <AppWrapper>
          <GlobalStyle />

          <SocketProvider socket={socket}>
            <Router>
              <Notifications />

              {store.isMinimized && <Redirect to="/minimized" />}
              <Switch>
                <Route exact path="/minimized">
                  <MinimizedView />
                </Route>
                <Route exact path="/user-list">
                  <UserListView />
                </Route>
                <Route exact path="/settings">
                  <SettingsView />
                </Route>
                <Route exact path="/">
                  <ChatView />
                </Route>
              </Switch>
            </Router>
          </SocketProvider>
        </AppWrapper>
      </ThemeProvider>
    );
  });

  ReactDOM.render(
    <StoreProvider>
      <App />
    </StoreProvider>,
    document.getElementById('app')
  );
};
