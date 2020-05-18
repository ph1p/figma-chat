import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { SharedIcon } from '../shared/style';
import { useStore } from '../store';

interface Props {
  title?: any;
  left?: any;
  right?: any;
  backButton?: boolean;
}

function CustomLink({ children, to, style = {}, className = '' }) {
  const history = useHistory();
  let match = useRouteMatch({
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
      className={match ? className + ' active' : className}
    >
      {children}
    </div>
  );
}

const Header: FunctionComponent<Props> = (props) => {
  const store = useStore();
  return (
    <Head>
      <CustomLink className="item" to="/">
        <div className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="10"
            fill="none"
          >
            <path
              stroke="#000"
              d="M6.5 1H9a3 3 0 013 3v2H6.5a2.5 2.5 0 010-5z"
            />
            <path
              fill="#fff"
              stroke="#000"
              d="M5.5 4H4a3 3 0 00-3 3v2h4.5a2.5 2.5 0 000-5z"
            />
          </svg>
        </div>
        <span>Chatroom</span>
      </CustomLink>
      <CustomLink className="item" to="/settings">
        <div className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="8"
            fill="none"
          >
            <circle cx="4" cy="4" r="1.5" stroke="#000" />
            <circle cx="4" cy="4" r="3.5" stroke="#000" />
          </svg>
        </div>
        <span>Settings</span>
      </CustomLink>
      <CustomLink style={{ marginLeft: 'auto' }} to="/user-list">
        <Users>
          <UserChips>
            <Chip />
            <Chip />
            <Chip />
          </UserChips>
          <Chip>+4</Chip>
        </Users>
      </CustomLink>
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
  background-color: #efeff3;
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
    box-shadow: 1px 0px 1px #ddd;
  }
`;

const Head = styled.div`
  height: 37px;
  border-bottom: 1px solid #e4e4e4;
  position: sticky;
  top: 0;
  z-index: 9;
  background-color: #fff;
  display: flex;
  padding: 0 16px;
  font-size: 11px;

  display: flex;
  width: 100%;
  .icon {
    margin-right: 6px;
  }
  .item {
    opacity: 0.4;
    font-weight: bold;
    margin-right: 16px;
    &.active {
      opacity: 1;
    }
  }

  .minus {
    position: relative;
    padding: 18px 0;
    margin-left: 19px;
    width: 11px;
    align-self: center;
    cursor: pointer;
    font-weight: bold;
    color: #fff;
    &::after {
      content: '';
      left: 0;
      top: 17px;
      position: absolute;
      width: 11px;
      height: 1px;
      background-color: #000;
    }
  }
`;

export default Header;
