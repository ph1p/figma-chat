import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';

import BackIcon from '@fc/shared/assets/icons/BackIcon';

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

const UserList: FunctionComponent<Props> = (props) => {
  const history = useHistory();

  return (
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
      <ShortcutTiles>
        <Tile name="back" onClick={() => history.push('/')}>
          <BackIcon />
        </Tile>
      </ShortcutTiles>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr 35px;
  width: 100vw;
  padding: 9px;
  height: 100%;

  h5 {
    color: #a2adc0;
    font-weight: normal;
    margin: 0 0 10px;
    font-size: 10px;
  }
  .users {
    overflow-y: auto;
    .user {
      padding: 4px 0;
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
        border-radius: 100%;
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

const Tile = styled.div<{ name: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.chatbarSecondaryBackground};
  border-radius: 100%;
  cursor: pointer;
  svg {
    transform: scale(0.8);

    path {
      fill: ${({ theme }) => theme.thirdFontColor};
    }
  }
`;

const ShortcutTiles = styled.div`
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  padding: 6px;
  border-radius: 94px;
  justify-self: start;
`;

export default UserList;
