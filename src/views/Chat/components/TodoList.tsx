import { observer } from 'mobx-react';
import styled from 'styled-components';
import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';

import { withSocketContext } from '../../../shared/SocketProvider';

interface ChatProps {
  socket: SocketIOClient.Socket;
}

const TodoList: FunctionComponent<ChatProps> = () => {
  const history = useHistory();
  return (
    <Wrapper>
      <Content onClick={() => history.push('/settings')}>
        <h3>
          <p>Todo</p>
          Hi! Before you start chatting
          <br />
          go to the settings and...
        </h3>
        <Item>✏️ ...choose a name</Item>
        <Item>🎨 ...choose a color</Item>
        <Item>🐨 ...choose an avatar</Item>
      </Content>
    </Wrapper>
  );
};

const Content = styled.div`
  margin: 0 auto;
`;

const Item = styled.div`
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  padding: 11px 16px;
  color: ${(p) => p.theme.thirdFontColor};
  border-radius: 14px;
  margin-top: 4px;
  cursor: pointer;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: calc(100% - 37px);
  width: 100%;
  h3 {
    text-align: center;
    color: ${(p) => p.theme.fontColor};
    margin: 0 0 32px;
    p {
      margin: 0px 0 4px;
      opacity: 0.4;
      font-weight: 300;
      font-size: 11px;
    }
  }
`;

export default withSocketContext(observer(TodoList));
