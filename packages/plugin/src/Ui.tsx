import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import Notifications from '@fc/shared/components/Notifications';
import UserListView from '@fc/shared/components/UserList';
import { SocketProvider } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import Header from './components/Header';
import EventEmitter from './shared/EventEmitter';
import { getStoreFromMain, StoreProvider, trunk, useStore } from './store';
import ChatView from './views/Chat';
import MinimizedView from './views/Minimized';
import './style.css';
import SettingsView from './views/Settings';

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

const App = observer(() => {
  const store = useStore();
  const [socket, setSocket] = useState<Socket>(null);

  const onFocus = () => {
    EventEmitter.emit('focus', false);
    store.setIsFocused(false);
  };

  const onFocusOut = () => {
    EventEmitter.emit('focus', false);
    store.setIsFocused(false);
  };

  const initSocketConnection = (url: string) => {
    store.setStatus(ConnectionEnum.NONE);

    if (socket) {
      socket.io.off('error');
      socket.io.off('reconnect_error');
      socket.off('chat message');
      socket.off('join leave message');
      socket.off('online');
      socket.disconnect();
    }

    setSocket(
      io(url, {
        reconnectionAttempts: 5,
        forceNew: true,
        transports: ['websocket'],
      })
    );
  };

  useEffect(() => {
    if (socket && store.status === ConnectionEnum.NONE) {
      socket.on('connect', () => {
        EventEmitter.ask('root-data').then((rootData: any) => {
          socket.io.off('error');
          socket.io.off('reconnect_error');
          socket.off('chat message');
          socket.off('join leave message');
          socket.off('online');

          const {
            roomName: dataRoomName = '',
            secret: dataSecret = '',
            history: messages = [],
            selection = {
              page: '',
              nodes: [],
            },
            settings = {},
            instanceId = '',
          } = rootData;

          store.setSecret(dataSecret);
          store.setRoomName(dataRoomName);
          store.setMessages(messages);
          store.setInstanceId(instanceId);
          store.setSelection(selection);

          store.persistSettings(settings, socket, true);

          // socket listener
          socket.io.on('error', () => store.setStatus(ConnectionEnum.ERROR));

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

          socket.on('online', (data) => {
            store.setOnline(data);
          });

          store.setStatus(ConnectionEnum.CONNECTED);

          socket.emit('set user', store.settings);
          socket.emit('join room', {
            room: dataRoomName,
            settings: store.settings,
          });

          EventEmitter.emit('ask-for-relaunch-message');
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.io.off('error');
        socket.io.off('reconnect_error');
        socket.off('chat message');
        socket.off('join leave message');
        socket.off('online');
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
    <ThemeProvider theme={store.theme}>
      <AppWrapper>
        <GlobalStyle />

        <SocketProvider socket={socket}>
          <Router>
            <Notifications
              notifications={store.notifications}
              deleteNotification={store.deleteNotification}
            />
            {store.settings.name && <Header minimized={store.isMinimized} />}
            {store.isMinimized && <Redirect to="/minimized" />}
            <Switch>
              <Route exact path="/minimized">
                <MinimizedView />
              </Route>
              <Route exact path="/user-list">
                <UserListView users={store.online} socketId={socket?.id || ''} />
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

getStoreFromMain().then((store) =>
  trunk.init(store).then(() =>
    ReactDOM.render(
      <StoreProvider>
        <App />
      </StoreProvider>,
      document.getElementById('app')
    )
  )
);
