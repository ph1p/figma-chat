import React, { FunctionComponent, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ConnectionEnum } from '../shared/interfaces';
import { state, view } from '../shared/state';

interface Props {
  text: string;
  retry?: (url: string) => void;
}

const ConnectionView: FunctionComponent<Props> = props => {
  const { push } = useHistory();

  return (
    <Connection>
      {state.status === ConnectionEnum.CONNECTED && <Redirect to="/" />}
      {state.status === ConnectionEnum.ERROR && (
        <Redirect to="/connection-error" />
      )}
      <div>
        <Text>{props.text}</Text>
        <button
          className="button button--secondary"
          onClick={() => props.retry(state.url)}
        >
          retry
        </button>
        <Settings
          className="button button--secondary"
          onClick={() => push('/settings')}
        >
          settings
        </Settings>
      </div>
    </Connection>
  );
};

const Connection = styled.div`
  display: grid;
  text-align: center;
  height: 100vh;
  width: 100vw;
  font-size: 14px;
  div {
    align-self: center;
  }
  button {
    cursor: pointer;
  }
`;

const Text = styled.div`
  margin-bottom: 20px;
`;

const Settings = styled.button`
  margin-left: 10px;
  cursor: pointer;
`;

export default view(ConnectionView);
