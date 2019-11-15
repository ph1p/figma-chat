import React, { FunctionComponent } from 'react';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import { view, state } from '../shared/state';
import Header from '../components/header';

const UserListScreen: FunctionComponent = () => {
  return (
    <>
      <Header
        title={state.user.name}
        backButton
        right={
          <Link to="/">
            <div className="icon icon--trash"></div>
          </Link>
        }
      />
      <UserList>UserList</UserList>
    </>
  );
};

const UserList = styled.div``;

export default view(UserListScreen);
