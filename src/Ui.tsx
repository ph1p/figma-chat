import { observer } from 'mobx-react-lite';
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
// components
import Notifications from './components/Notifications';
import { SocketProvider } from './shared/SocketProvider';
// shared
import { ConnectionEnum } from './shared/interfaces';
// views
import ChatView from './views/Chat';
import MinimizedView from './views/Minimized';
import SettingsView from './views/Settings';
import UserListView from './views/UserList';

import theme from './shared/theme';
import { useStore, StoreProvider } from './store';
import Header from './components/Header';

import './style.css';
import MessageEmitter from './shared/MessageEmitter';

MessageEmitter.on('ready', (_, emit) => emit('initialize'));

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(p) => p.theme.backgroundColor};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(p) => p.theme.scrollbarColor};
  }
`;

const AppWrapper = styled.div`
  overflow: hidden;
`;

MessageEmitter.on('initialize', () => {
  const App = observer(() => {
    const store = useStore();
    const [socket, setSocket] = useState<SocketIOClient.Socket>(null);

    const onFocus = () => {
      MessageEmitter.emit('focus', false);
      store.setIsFocused(false);
    };

    const onFocusOut = () => {
      MessageEmitter.emit('focus', false);
      store.setIsFocused(false);
    };

    const initSocketConnection = (url: string) => {
      store.setStatus(ConnectionEnum.NONE);

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
    };

    useEffect(() => {
      if (socket && store.status === ConnectionEnum.NONE) {
        MessageEmitter.emit('get-root-data');
        socket.on('connect', () => {
          store.setStatus(ConnectionEnum.CONNECTED);

          socket.emit('set user', store.settings);
          socket.emit('join room', {
            room: store.roomName,
            settings: store.settings,
          });

          MessageEmitter.emit('ask-for-relaunch-message');
        });

        socket.io.on('connect_error', () =>
          store.setStatus(ConnectionEnum.ERROR)
        );

        socket.io.on('reconnect_error', () =>
          store.setStatus(ConnectionEnum.ERROR)
        );

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

        socket.on('online', (data) => store.setOnline(data));
      }

      return () => {
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
      };
    }, [socket]);

    useEffect(() => {
      if (store.settings.url) {
        initSocketConnection(store.settings.url);
      }
      // check focus
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onFocusOut);

      return () => {
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('blur', onFocusOut);
      };
    }, [store.settings.url]);

    return (
      <ThemeProvider theme={theme(store.settings.isDarkTheme)}>
        <AppWrapper>
          <GlobalStyle color={store.settings.color} />

          <SocketProvider socket={socket}>
            <Router>
              <Notifications />

              {store.settings.name && <Header minimized={store.isMinimized} />}
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
});
