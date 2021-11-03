import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import ChatIcon from '@fc/shared/assets/icons/ChatIcon';
import SettingsIcon from '@fc/shared/assets/icons/SettingsIcon';
import { CustomLink } from '@fc/shared/components/CustomLink';

import { useStore } from '../store';

interface Props {
  minimized?: boolean;
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

      <div className="minus" onClick={() => store.toggleMinimizeChat()}></div>
    </Head>
  );
};

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
