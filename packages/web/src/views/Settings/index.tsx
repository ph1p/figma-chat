import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

import BackIcon from '@fc/shared/assets/icons/BackIcon';
import ThemeIcon from '@fc/shared/assets/icons/ThemeIcon';
import TrashIcon from '@fc/shared/assets/icons/TrashIcon';
import Tooltip from '@fc/shared/components/Tooltip';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { DEFAULT_SERVER_URL } from '@fc/shared/utils/constants';

import { useStore } from '../../store/RootStore';

import AvatarColorPicker from './components/AvatarColorPicker';

export const Settings: FunctionComponent = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const navigate = useNavigate();
  const settings = useLocalObservable(() => ({
    url: DEFAULT_SERVER_URL,
    setUrl(url: string) {
      this.url = url;
    },
  }));

  const currentUser = useLocalObservable(() => ({
    name: '',
    setName(name?: string) {
      if (name) {
        this.name = name;
      }
    },
  }));

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!store.currentUser.name && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    currentUser.setName(store.currentUser.name);
    settings.setUrl(store.settings.url);
  }, [store.settings]);

  const saveSettings = (shouldClose = true) => {
    store.persistSettings(settings);

    if (shouldClose) {
      navigate('/');
    }
  };

  const saveCurrentUser = (shouldClose = true) => {
    if (store.currentUser.name !== currentUser.name) {
      store.addNotification(`Name successfully updated`);
    }

    store.persistCurrentUser(currentUser, socket);

    if (shouldClose) {
      navigate('/');
    }
  };

  return (
    <Wrapper>
      <Picker>
        <AvatarColorPicker />
      </Picker>

      <InputWrapper>
        <User>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            ref={nameInputRef}
            value={currentUser.name}
            onBlur={({ target }: any) => saveCurrentUser(false)}
            onChange={({ target }: any) =>
              currentUser.setName(target.value.substr(0, 20))
            }
            onKeyDown={(e: any) => e.keyCode === 13 && e.target.blur()}
          />
        </User>
        <ServerUrl>
          <label htmlFor="server-url">
            Server-URL
            <span
              onClick={() => {
                settings.setUrl(DEFAULT_SERVER_URL);
                saveSettings(settings.url !== store.settings.url);
              }}
            >
              <strong>(reset)</strong>
            </span>
          </label>
          <input
            id="server-url"
            type="text"
            value={settings.url}
            onBlur={({ target }: any) =>
              saveSettings(target.value !== store.settings.url)
            }
            onChange={({ target }: any) =>
              settings.setUrl(target.value.substr(0, 255))
            }
            onKeyDown={(e: any) => e.keyCode === 13 && e.target.blur()}
          />
        </ServerUrl>
      </InputWrapper>

      <Footer>
        <ShortcutTiles>
          <Tile name="back" onClick={() => navigate('/')}>
            <BackIcon />
          </Tile>
        </ShortcutTiles>
        <ShortcutTiles>
          <Tooltip
            hover
            handler={observer(
              (_: any, ref: any) => (
                <Tile
                  name="theme"
                  ref={ref}
                  onClick={() => {
                    store.setIsDarkTheme(!store.settings.isDarkTheme);
                    saveSettings(false);
                  }}
                >
                  <ThemeIcon active={store.settings.isDarkTheme} />
                </Tile>
              ),
              { forwardRef: true }
            )}
          >
            Theme
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              (_: any, ref: any) => (
                <Tile
                  name="trash"
                  ref={ref}
                  onClick={() => store.clearChatHistory()}
                >
                  <TrashIcon />
                </Tile>
              ),
              { forwardRef: true }
            )}
          >
            History
          </Tooltip>
        </ShortcutTiles>
      </Footer>
    </Wrapper>
  );
});

const InputWrapper = styled.div`
  padding: 0 12px;
`;

const ServerUrl = styled.div`
  input[type='text'] {
    color: ${(p) => p.theme.brighterInputFont} !important;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 9px;
`;

const User = styled.div`
  margin: 0 0 24px;
  position: relative;
  input {
    padding-right: 30px !important;
  }
  .icon {
    position: absolute;
    right: 0;
    bottom: 9px;
    svg path {
      fill: ${(p) => p.theme.inputColor};
    }
  }
`;

const Picker = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
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
  }
  ${(p) => {
    if (p.name === 'trash') {
      return css`
        background-color: #fd5959;
        svg {
          path {
            fill: #fff;
            stroke: #fff;
          }
          path:last-child {
            stroke: #fd5959;
          }
        }
      `;
    }

    if (p.name === 'theme') {
      return css`
        svg {
          path {
            fill: ${({ theme }) => theme.thirdFontColor};
          }
        }
      `;
    }

    if (p.name === 'back') {
      return css`
        svg {
          path {
            fill: ${({ theme }) => theme.thirdFontColor};
          }
        }
      `;
    }

    if (p.name === 'bell' || p.name === 'message') {
      return css`
        svg {
          path {
            fill: ${({ theme }) => theme.thirdFontColor};
            &:nth-child(2) {
              stroke: ${({ theme }) => theme.secondaryBackgroundColor};
            }
          }
        }
      `;
    }
  }}
`;

const ShortcutTiles = styled.div`
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  padding: 6px;
  border-radius: 94px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  & > div {
    margin-right: 5px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 9px;
  height: 100%;
  display: grid;
  grid-template-rows: 242px 1fr 44px;

  h4 {
    margin: 20px 0 15px;
    &:first-child {
      margin-top: 0;
    }
  }
  span {
    opacity: 0.8;
    margin: 0 0 0 8px;
    font-size: 10px;
    cursor: pointer;
  }
  a {
    color: ${(p) => p.theme.inputColor};
    font-weight: bold;
  }
  label {
    margin: 0 0 5px;
    color: #a2adc0;
    text-transform: uppercase;
    font-size: 10px;
    display: block;
  }
  input[type='text'] {
    font-size: 14px;
    width: 100%;
    border-width: 0 0 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.inputColor};
    padding: 8px 0 9px;
    outline: none;
    font-weight: bold;
    &::placeholder {
      color: #999;
    }
    &:focus {
      border-color: ${(p) => p.theme.inputColor};
    }
  }
`;
