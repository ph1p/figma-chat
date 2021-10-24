import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

interface Props {
  users: {
    id: string;
    name: string;
    avatar: string;
    color: string;
    photoUrl: string;
  }[];
  socketId: string;
}

const UserList: FunctionComponent<Props> = (props) => (
  <Wrapper>
    <h5>Active Users</h5>
    <div className="users">
      {props.users.map((user) => {
        return (
          <div key={user.id} className="user">
            <div
              className="color"
              style={{
                backgroundColor: user.color || '#000',
                backgroundImage: !user?.avatar
                  ? `url(${user.photoUrl})`
                  : undefined,
              }}
            >
              {user.avatar}
            </div>
            <div className={`name ${!user.name ? 'empty' : ''}`}>
              {user.name || 'Anon'}
              {user.id === props.socketId && <p>you</p>}
            </div>
          </div>
        );
      })}
    </div>
  </Wrapper>
);

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100vw;
  height: calc(100vh - 33px);
  padding: 8px 16px;
  h5 {
    color: #a2adc0;
    font-weight: normal;
    margin: 10px 0;
    font-size: 10px;
  }
  .users {
    overflow-y: auto;
    .user {
      padding: 8px 0;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      .name {
        color: ${(p) => p.theme.fontColor};
        &.empty {
          font-weight: normal;
          font-style: italic;
        }
        p {
          color: #999;
          font-size: 10px;
          margin: 2px 0 0 0;
          font-weight: 400;
        }
      }
      .color {
        background-size: cover;
        border-radius: 14px 14px 3px 14px;
        width: 41px;
        height: 41px;
        margin-right: 17px;
        font-size: 22px;
        text-align: center;
        line-height: 43px;
      }
    }
  }
`;

export default UserList;
