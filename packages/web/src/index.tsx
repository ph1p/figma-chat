import './style.css';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, BrowserRouter } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { SocketProvider } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { App } from './App';
import { StoreProvider, trunk, useStore } from './store/RootStore';

const GlobalStyle = createGlobalStyle`
  #root, body, html {
    height: 100%;
    background-color: ${(p) => p.theme.secondaryBackgroundColor};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(p) => p.theme.scrollbarColor};
  }

  .button {
    color: ${(p) => p.theme.fontColor};
    background-color: ${(p) => p.theme.thirdBackgroundColor};
    border: 0;
    padding: 10px 14px;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    &:hover {
      background-color: ${(p) => p.theme.secondaryBackgroundColor};
    }
  }
`;
trunk.init().then(() => {
  const InitApp = observer(() => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const store = useStore();
    const navigate = useNavigate();

    const logout = () => {
      store.addNotification('Credentials not valid');
      store.setSecret('');
      store.setRoom('');
      store.setOnline([]);
      socket?.disconnect();
      if (history) {
        navigate('/', {
          replace: true,
        });
      }
    };

    useEffect(() => {
      if (socket) {
        socket.io.off('error');
        socket.io.off('reconnect_error');
        socket.off('chat message');
        socket.off('join leave message');
        socket.off('online');
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
        const connect = () => {
          store.setStatus(ConnectionEnum.CONNECTED);

          if (store.room && store.secret) {
            socket.emit('login', {
              room: store.room,
              settings: toJS(store.settings),
            });

            socket.once('login failed', logout);
          }
        };
        const error = () => store.setStatus(ConnectionEnum.ERROR);
        const chatMessage = (data: any) => store.addReceivedMessage(data);
        const joinLeave = (data: any) => {
          const username = data.user.name || 'Anon';
          let message = 'joins the conversation';

          if (data.type === 'LEAVE') {
            message = 'leaves the conversation';
          }

          store.addNotification(`${username} ${message}`);
        };
        const online = (data: any) => store.setOnline(data);

        socket.on('connect', connect);
        socket.io.on('error', error);
        socket.io.on('reconnect_error', error);
        socket.on('chat message', chatMessage);
        socket.on('join leave message', joinLeave);
        socket.on('online', online);
      }

      return () => {
        if (socket) {
          socket.off('connect');
          socket.io.off('error');
          socket.io.off('reconnect_error');
          socket.off('chat message');
          socket.off('join leave message');
          socket.off('online');
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
        <BrowserRouter>
          <InitApp />
        </BrowserRouter>
      </StoreProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
});
