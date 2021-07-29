import './style.css';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import io, { Socket } from 'socket.io-client';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { SocketProvider } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { App } from './App';
import { StoreProvider, trunk, useStore } from './store/RootStore';

const GlobalStyle = createGlobalStyle`
  #root, body, html {
    height: 100%;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(p) => p.theme.scrollbarColor};
  }
`;

trunk.init().then(() => {
  const InitApp = observer(() => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const store = useStore();

    useEffect(() => {
      if (socket) {
        socket.offAny();
        socket.disconnect();
      }

      setSocket(
        io(store.settings.url, {
          reconnectionAttempts: 3,
          forceNew: true,
          transports: ['websocket'],
        })
      );
    }, [store.settings.url]);

    useEffect(() => {
      if (socket) {
        socket.on('connect', () => {
          store.setStatus(ConnectionEnum.CONNECTED);

          if (store.room && store.secret) {
            socket.emit('set user', toJS(store.settings));
            socket.emit('join room', {
              room: store.room,
              settings: toJS(store.settings),
            });
          }
        });

        socket.io.on('error', () => store.setStatus(ConnectionEnum.ERROR));

        socket.io.on('reconnect_error', () =>
          store.setStatus(ConnectionEnum.ERROR)
        );

        socket.on('chat message', (data) => store.addReceivedMessage(data));

        socket.on('join leave message', (data) => {
          const username = data.user.name || 'Anon';
          let message = 'joins the conversation';

          if (data.type === 'LEAVE') {
            message = 'leaves the conversation';
          }

          console.log(`${username} ${message}`);
          // store.addNotification(`${username} ${message}`);
        });

        socket.on('online', (data) => store.setOnline(data));
      }
      return () => {
        if (socket) {
          socket.offAny();
          socket.disconnect();
        }
      };
    }, [socket]);

    return (
      <SocketProvider socket={socket}>
        <ThemeProvider theme={store.theme}>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </SocketProvider>
    );
  });

  ReactDOM.render(
    <React.StrictMode>
      <StoreProvider>
        <InitApp />
      </StoreProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
});
