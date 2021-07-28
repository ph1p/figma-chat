import Header from '@plugin/components/Header';
import Notifications from '@plugin/components/Notifications';
import {
  getStoreFromMain,
  StoreProvider,
  trunk,
  useStore,
} from '@plugin/store';
import '@plugin/style.css';
import ChatView from '@plugin/views/Chat';
import MinimizedView from '@plugin/views/Minimized';
import SettingsView from '@plugin/views/Settings';
import UserListView from '@plugin/views/UserList';
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

import { SocketProvider } from '@shared/utils/SocketProvider';
import { ConnectionEnum } from '@shared/utils/interfaces';

import EventEmitter from './shared/EventEmitter';

// onmessage = (message) => {
//   if (message.data.pluginMessage) {
//     const { type } = message.data.pluginMessage;

//     // initialize
//     if (type === 'ready') {
//       sendMainMessage('initialize');
//     }

//     if (type === 'initialize') {
//       init();
//     }
//   }
// };

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
      socket.offAny();
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
      socket.on('connect', () => {
        EventEmitter.ask('root-data').then((rootData: any) => {
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
        socket.offAny();
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

getStoreFromMain().then((store) => {
  trunk.init(store).then(() => {
    ReactDOM.render(
      <StoreProvider>
        <App />
      </StoreProvider>,
      document.getElementById('app')
    );
  });
});
