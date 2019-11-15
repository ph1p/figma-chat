import React, { FunctionComponent } from 'react';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import { view, state } from '../shared/state';
import Header from '../components/header';

const ChatScreen: FunctionComponent = () => {
  return (
    <>
      <Header
        title={state.user.name}
        right={<div>2</div>}
        left={
          <Link to="/settings">
            <div className="icon icon--adjust"></div>
          </Link>
        }
      />
      <Chat>Chat</Chat>
    </>
  );
};

const Chat = styled.div``;

export default view(ChatScreen);
