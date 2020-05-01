import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
// store
import { observer } from 'mobx-react';
import { useStore } from '../store';
const UserListView: FunctionComponent = () => {
  const store = useStore();

  return (
    <>
      <Header title="Currently online" backButton />
      <UserList>
        <div className="users">
          {store.online.map((user) => (
            <div key={user.id} className="user">
              <div
                className="color"
                style={{ backgroundColor: user.color || '#000' }}
              />
              <div className={`name ${!user.name ? 'empty' : ''}`}>
                {user.name || 'Anon'}
              </div>
            </div>
          ))}
        </div>
      </UserList>
    </>
  );
};

const UserList = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100vw;
  height: calc(100vh - 33px);
  .users {
    overflow-y: auto;
    .user {
      border-bottom: 1px solid #e9e9e9;
      padding: 10px 15px;
      font-weight: bold;
      display: flex;
      align-items: center;
      .name {
        &.empty {
          font-weight: normal;
          font-style: italic;
        }
      }
      .color {
        border-radius: 100%;
        width: 12px;
        height: 12px;
        margin-right: 10px;
      }
    }
  }
`;

export default observer(UserListView);
