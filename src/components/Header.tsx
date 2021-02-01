import { observer } from 'mobx-react';
import React, { FunctionComponent } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import ChatIcon from '../assets/icons/ChatIcon';
import SettingsIcon from '../assets/icons/SettingsIcon';
import { ConnectionEnum } from '../shared/interfaces';
import { useStore } from '../store';

interface Props {
  minimized?: boolean;
}

function CustomLink({ children, to, style = {}, className = '' }) {
  const history = useHistory();
  const match = useRouteMatch({
    path: to,
    exact: true,
  });

  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      onClick={() => history.push(to)}
      className={match ? `${className} active` : className}
    >
      {children}
    </div>
  );
}

const Header: FunctionComponent<Props> = (props) => {
  const store = useStore();

  if (props.minimized) {
    return (
      <Head>
        <div className="plus" onClick={() => store.toggleMinimizeChat()}></div>
      </Head>
    );
  }

  return (
    <Head>
      <CustomLink className="item" to="/">
        <div className="icon">
          <ChatIcon />
        </div>
        <span>Chatroom</span>
      </CustomLink>
      <CustomLink className="item" to="/settings">
        <div className="icon">
          <SettingsIcon />
        </div>
        <span>Settings</span>
      </CustomLink>
      {store.status === ConnectionEnum.CONNECTED ? (
        <CustomLink style={{ marginLeft: 'auto' }} to="/user-list">
          <Users>
            <UserChips>
              {store.online
                .filter((_, i) => i < 5)
                .map((user) => (
                  <Chip key={user.id} style={{ backgroundColor: user.color }}>
                    {user?.avatar || ''}
                  </Chip>
                ))}
            </UserChips>
            {store.online.length > 5 && <Chip>+{store.online.length - 5}</Chip>}
          </Users>
        </CustomLink>
      ) : (
        <Users />
      )}
      <div className="minus" onClick={() => store.toggleMinimizeChat()}></div>
    </Head>
  );
};

const Users = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const Chip = styled.div`
  min-width: 19px;
  min-height: 19px;
  max-height: 19px;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 40px;
  padding: 2px 2px;
  text-align: center;
  color: #000;
`;

const UserChips = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 4px;
  ${Chip} {
    margin-left: -10px;
    line-height: 15px;
    font-size: 9px;
    text-align: center;
  }
`;

const Head = styled.div`
  display: flex;
  height: 37px;

  border-bottom: 1px solid ${(p) => p.theme.borderColor};
  top: 0;
  z-index: 9;
  display: flex;
  padding: 0 16px;
  font-size: 11px;

  .icon {
    margin-right: 6px;
    svg {
      path {
        fill: ${(p) => p.theme.backgroundColor};
      }
      circle,
      path {
        stroke: ${(p) => p.theme.fontColor};
      }
    }
  }

  .item {
    color: ${(p) => p.theme.fontColor};
    opacity: 0.4;
    font-weight: bold;
    margin-right: 16px;
    &.active,
    &:hover {
      opacity: 1;
    }
  }

  .minus,
  .plus {
    position: relative;
    padding: 18px 0;
    margin-left: 14px;
    width: 11px;
    align-self: center;
    cursor: pointer;
    font-weight: bold;
    &::after {
      content: '';
      left: 0;
      top: 17px;
      position: absolute;
      width: 11px;
      height: 1px;
      background-color: ${(p) => p.theme.fontColor};
    }
  }
  .plus {
    margin-left: auto;
    &::before {
      content: '';
      left: 5px;
      top: 12px;
      position: absolute;
      width: 1px;
      height: 11px;
      background-color: ${(p) => p.theme.fontColor};
    }
  }
`;

export default observer(Header);
