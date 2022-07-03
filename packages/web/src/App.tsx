import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { CustomLink } from '@fc/shared/components/CustomLink';
import Notifications from '@fc/shared/components/Notifications';
import UserListView from '@fc/shared/components/UserList';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import LogoPNG from './assets/logo.png';
import { useStore } from './store/RootStore';
import { Chat } from './views/Chat';
import { Login } from './views/Login';
import { Settings } from './views/Settings';

export const App = observer(() => {
  const store = useStore();
  const socket = useSocket();
  const navigate = useNavigate();

  const leaveRoom = useCallback(() => {
    store.setSecret('');
    store.setRoom('');
    store.setOnline([]);
    socket?.disconnect();

    if (navigate) {
      navigate('/', {
        replace: true,
      });
    }
  }, [store, navigate, socket]);

  return (
    <Wrapper>
      <Notifications
        notifications={store.notifications}
        deleteNotification={store.deleteNotification}
      />
      <Header>
        <Left>
          <CustomLink to="/">
            <img src={LogoPNG} />
          </CustomLink>
        </Left>

        <Menu>
          <CustomLink className="menu-item" to="/">
            Chat
          </CustomLink>
          <CustomLink className="menu-item" to="/settings">
            <span>Settings</span>
          </CustomLink>

          {store.room &&
            store.settings &&
            store.status === ConnectionEnum.CONNECTED && (
              <button className="menu-item logout" onClick={leaveRoom}>
                Logout
              </button>
            )}
        </Menu>
      </Header>
      <Content>
        <Routes>
          <Route
            path="/"
            element={
              !store.room ||
              !store.secret ||
              store.status !== ConnectionEnum.CONNECTED ? (
                <Login />
              ) : (
                <Chat />
              )
            }
          />
          <Route
            path="/user-list"
            element={
              <UserListView users={store.online} user={store.currentUser} />
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Content>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  height: 100%;
  max-height: 100%;
  max-width: 600px;
  background-color: ${(p) => p.theme.backgroundColor};
  @media (min-width: 450px) {
    border-radius: 8px;
    box-shadow: 0 0 100px ${(p) => p.theme.backgroundColor};
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 550px;
  }
`;

const Content = styled.div`
  height: calc(100% - 50px);
`;

const Menu = styled.div`
  display: flex;
  align-self: flex-end;
  .menu-item {
    text-decoration: none;
    color: ${(p) => p.theme.fontColor};
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    padding: 4px 8px 14px;
    transition: 0.2s all;
    &.logout {
      color: ${(p) => p.theme.placeholder};
    }
    &:hover,
    &.active {
      border-color: ${(p) => p.theme.fontColor};
    }
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  a {
    text-decoration: none;
  }
`;

const Header = styled.div`
  height: 50px;
  overflow: hidden;
  border-bottom: 1px solid ${(p) => p.theme.secondaryBackgroundColor};
  padding: 0 7px 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  img {
    width: 30px;
    height: 30px;
    border-radius: 30px;
    display: block;
    margin-top: 1px;
  }
`;
