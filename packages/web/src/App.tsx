import { observer } from 'mobx-react-lite';
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Link } from 'react-router-dom';
import styled from 'styled-components';

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

  const leaveRoom = () => {
    store.setSecret('');
    store.setRoom('');
    store.setOnline([]);
    socket?.disconnect();
  };

  return (
    <Wrapper>
      <Router>
        <Notifications
          notifications={store.notifications}
          deleteNotification={store.deleteNotification}
        />
        <Header>
          <Link to="/">
            <img src={LogoPNG} />
          </Link>

          <Right>
            {store.status === ConnectionEnum.CONNECTED ? (
              <Link style={{ marginLeft: 'auto' }} to="/user-list">
                <Users>
                  <UserChips>
                    {store.online
                      .filter((_, i) => i < 5)
                      .map((user) => (
                        <Chip
                          key={user.id}
                          style={{ backgroundColor: user.color }}
                        >
                          {user?.avatar || ''}
                        </Chip>
                      ))}
                  </UserChips>
                  {store.online.length > 5 && (
                    <Chip>+{store.online.length - 5}</Chip>
                  )}
                </Users>
              </Link>
            ) : null}
            <Link className="button" to="/settings">
              <span>Settings</span>
            </Link>

            {store.room &&
              store.settings &&
              store.status === ConnectionEnum.CONNECTED && (
                <button className="button" onClick={leaveRoom}>
                  leave room
                </button>
              )}
          </Right>
        </Header>
        <Content>
          <Switch>
            <Route path="/user-list">
              <UserListView users={store.online} socketId={socket?.id || ''} />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/">
              {!store.room || !store.secret ? <Login /> : <Chat />}
            </Route>
          </Switch>
        </Content>
      </Router>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  height: 100%;
  max-height: 100%;
  max-width: 500px;
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

const Right = styled.div`
  display: flex;
  align-items: center;
  button {
    margin-left: 7px;
  }
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

const Users = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 7px;
`;

const Chip = styled.div`
  min-width: 29px;
  min-height: 29px;
  max-height: 29px;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 40px;
  padding: 2px 2px;
  text-align: center;
  color: #000;
  border: 3px solid #fff;
`;

const UserChips = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 4px;
  ${Chip} {
    margin-left: -10px;
    line-height: 20px;
    font-size: 12px;
    text-align: center;
  }
`;
