// store
import { observer } from 'mobx-react';
import React, { FunctionComponent } from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import { ConnectionEnum } from '../shared/interfaces';
import { SharedIcon } from '../shared/style';
import { useStore } from '../store';

const MinimizedView: FunctionComponent = () => {
  const store = useStore();

  return (
    <>
      <Header
        title={
          <Title color={store.settings.color || '#000'}>
            {store.settings.name}
          </Title>
        }
        left={<span></span>}
        right={
          <SharedIcon onClick={() => store.toggleMinimizeChat()}>
            <div className="icon icon--plus" />
          </SharedIcon>
        }
      />
      <Minimized>
        {!store.isMinimized && <Redirect to="/" />}
        {store.status === ConnectionEnum.ERROR && (
          <Redirect to="/connection-error" />
        )}
        <Users>
          {store.online.map((user) => (
            <User key={user.id} className="user" color={user.color || '#000'}>
              {user.name.substr(0, 2)}
            </User>
          ))}
        </Users>
      </Minimized>
    </>
  );
};

const Minimized = styled.div`
  display: grid;
  text-align: center;
  min-height: calc(100vh - 33px);
  max-width: 100vw;
  font-size: 14px;
  div {
    align-self: center;
  }
  button {
    cursor: pointer;
  }
`;

const Title = styled.div`
  margin-left: 10px;
  color: ${(props) => props.color};
`;

const Users = styled.div`
  overflow-y: auto;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  padding: 10px;
`;

const User = styled.div`
  width: 40px;
  height: 40px;
  padding: 11px 0;
  align-items: center;
  text-align: center;
  border-radius: 100%;
  color: #fff;
  background-color: ${(props) => props.color};
`;

export default observer(MinimizedView);
