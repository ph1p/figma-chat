import { observer } from 'mobx-react-lite';
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Link } from 'react-router-dom';
import styled from 'styled-components';

import Notifications from '@fc/shared/components/Notifications';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import LogoPNG from './assets/logo.png';
import { useStore } from './store/RootStore';
import { Chat } from './views/Chat';
import { Login } from './views/Login';
import { Settings } from './views/Settings';

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
  a {
    color: ${(p) => p.theme.fontColor};
    margin-right: 10px;
  }
`;
const Header = styled.div`
  height: 50px;
  overflow: hidden;
  border-bottom: 1px solid ${(p) => p.theme.secondaryBackgroundColor};
  padding: 0 14px;
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

export const App = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const leaveRoom = () => {
    store.setSecret('');
    store.setRoom('');
    socket?.disconnect();
  };

  return (
    <Wrapper>
      <Router>
        <Notifications notifications={store.notifications} />
        <Header>
          <Link to="/">
            <img src={LogoPNG} />
          </Link>

          <Right>
            <Link to="/settings">
              <span>Settings</span>
            </Link>

            {store.room &&
              store.settings &&
              store.status === ConnectionEnum.CONNECTED && (
                <button onClick={leaveRoom}>leave room</button>
              )}
          </Right>
        </Header>
        <Content>
          <Switch>
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
