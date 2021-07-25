import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import Tooltip from '@shared/components/Tooltip';
import { ConnectionEnum } from '@shared/utils/interfaces';

import { useStore } from '../store';

const MinimizedView: FunctionComponent = () => {
  const store = useStore();

  return (
    <Minimized>
      {!store.isMinimized && <Redirect to="/" />}
      {store.status === ConnectionEnum.ERROR && (
        <Redirect to="/connection-error" />
      )}
      <Users>
        {store.online.map((user) => (
          <Tooltip
            hover
            key={user.id}
            handler={observer(
              (_, ref) => (
                <User
                  key={user.id}
                  ref={ref}
                  className="user"
                  color={user.color || '#000'}
                >
                  {user.avatar || user.name.substr(0, 2)}
                </User>
              ),
              { forwardRef: true }
            )}
          >
            {user.name}
          </Tooltip>
        ))}
      </Users>
    </Minimized>
  );
};

const Minimized = styled.div`
  display: grid;
  text-align: center;
  min-height: calc(100vh - 37px);
  max-width: 100vw;
  font-size: 14px;
  div {
    align-self: center;
  }
  button {
    cursor: pointer;
  }
`;

const Users = styled.div`
  overflow-y: auto;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  padding: 14px;
`;

const User = styled.div`
  border-radius: 14px 14px 3px 14px;
  width: 41px;
  height: 41px;
  font-size: 22px;
  text-align: center;
  line-height: 43px;
  color: #fff;
  background-color: ${(props) => props.color};
`;

export default observer(MinimizedView);
