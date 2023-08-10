import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

import BackIcon from '@fc/shared/assets/icons/BackIcon';
import BellIcon from '@fc/shared/assets/icons/BellIcon';
import ChainIcon from '@fc/shared/assets/icons/ChainIcon';
import MessageIcon from '@fc/shared/assets/icons/MessageIcon';
import ThemeIcon from '@fc/shared/assets/icons/ThemeIcon';
import TrashIcon from '@fc/shared/assets/icons/TrashIcon';
import Tooltip from '@fc/shared/components/Tooltip';
import { DEFAULT_SERVER_URL } from '@fc/shared/utils/constants';

import { useStore } from '../../store';

import AvatarColorPicker from './components/AvatarColorPicker';

const SettingsView: FunctionComponent = observer(() => {
  const store = useStore();

  const navigate = useNavigate();
  const settings = useLocalObservable(() => ({
    url: DEFAULT_SERVER_URL,
    enableNotificationTooltip: true,
    setUrl(url) {
      this.url = url;
    },
    setEnableNotificationTooltip(flag) {
      this.enableNotificationTooltip = flag;
    },
  }));

  useEffect(() => {
    settings.setUrl(store.settings.url);
    settings.setEnableNotificationTooltip(
      store.settings.enableNotificationTooltip
    );
  }, [store.settings]);

  const saveSettings = (shouldClose = true) => {
    store.persistSettings(settings);

    if (shouldClose) {
      navigate('/');
    }
  };

  return (
    <Settings $isDevMode={store.figmaEditorType === 'dev'}>
      <Picker>
        <AvatarColorPicker />
      </Picker>

      <InputWrapper>
        <Invite>
          <label>
            Auth-String -{' '}
            <a href="https://figma-chat.vercel.app/" target="_blank">
              Open external Chat {'->'}
            </a>
          </label>
          <input
            type="text"
            readOnly
            value={Buffer.from(`${store.roomName};${store.secret}`).toString(
              'base64'
            )}
          />
          <div className="icon">
            <a href="https://figma-chat.vercel.app/" target="_blank">
              <ChainIcon />
            </a>
          </div>
        </Invite>
        <ServerUrl>
          <label htmlFor="server-url">
            Server-URL
            <span
              className="link"
              onClick={() => {
                settings.setUrl(DEFAULT_SERVER_URL);
                saveSettings(settings.url !== store.settings.url);
              }}
            >
              <strong>reset</strong>
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

      <Footer $isDevMode={store.figmaEditorType === 'dev'}>
        <ShortcutTiles>
          <Tile name="back" onClick={() => navigate('/')}>
            <BackIcon />
          </Tile>
        </ShortcutTiles>
        <ShortcutTiles>
          <Tooltip
            hover
            handler={observer(
              (_, ref) => (
                <Tile
                  name="message"
                  ref={ref}
                  onClick={() => {
                    settings.setEnableNotificationTooltip(
                      !settings.enableNotificationTooltip
                    );
                    saveSettings(false);
                  }}
                >
                  <MessageIcon active={settings.enableNotificationTooltip} />
                </Tile>
              ),
              { forwardRef: true }
            )}
          >
            Notifications
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              (_, ref) => (
                <Tile
                  name="theme"
                  ref={ref}
                  onClick={() => {
                    store.setDarkTheme(!store.settings.isDarkTheme);
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
              (_, ref) => (
                <Tile
                  name="bell"
                  ref={ref}
                  onClick={() => {
                    store.setSetting(
                      'enableNotificationSound',
                      !store.settings.enableNotificationSound
                    );
                    saveSettings(false);
                  }}
                >
                  <BellIcon active={store.settings.enableNotificationSound} />
                </Tile>
              ),
              { forwardRef: true }
            )}
          >
            Sound
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              (_, ref) => (
                <Tile
                  name="trash"
                  ref={ref}
                  onClick={() =>
                    store.clearChatHistory(() => saveSettings(true))
                  }
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
    </Settings>
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

const Footer = styled.div<{$isDevMode: boolean}>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 9px;
  padding-right: ${({ $isDevMode }) => ($isDevMode ? 70 : 0)};
  align-self: center;
`;

const Invite = styled.div`
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

const Settings = styled.div<{$isDevMode:boolean}>`
  position: relative;
  z-index: 1;
  padding: 0 9px;
  height: 100%;
  display: grid;
  grid-template-rows: 242px 1fr ${p => p.$isDevMode ? 70 : 44}px;

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
  a, .link {
    color: ${(p) => p.theme.inputColor};
    font-weight: bold;
    text-decoration: underline;
  }
  label {
    margin: 0 0 5px;
    color: #a2adc0;
    text-transform: uppercase;
    font-size: 10px;
    display: block;
  }
  input[type='text'] {
    font-size: 13px;
    width: 100%;
    border-width: 0 0 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.inputColor};
    padding: 8px 0 9px;
    outline: none;
    font-weight: 600;
    &::placeholder {
      color: #999;
    }
    &:focus {
      border-color: ${(p) => p.theme.inputColor};
    }
  }
`;

export default SettingsView;
