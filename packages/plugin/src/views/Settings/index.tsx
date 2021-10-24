import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';

import BellIcon from '@fc/shared/assets/icons/BellIcon';
import MessageIcon from '@fc/shared/assets/icons/MessageIcon';
import ThemeIcon from '@fc/shared/assets/icons/ThemeIcon';
import TrashIcon from '@fc/shared/assets/icons/TrashIcon';
import Tooltip from '@fc/shared/components/Tooltip';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { DEFAULT_SERVER_URL } from '@fc/shared/utils/constants';

import pkg from '../../../package.json';
import { useStore } from '../../store';

import AvatarPicker from './components/AvatarPicker';
import ColorPicker from './components/ColorPicker';

const SettingsView: FunctionComponent = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const history = useHistory();
  const settings = useLocalObservable(() => ({
    name: '',
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
    if (store.isMinimized) {
      store.toggleMinimizeChat();
    }
  }, []);

  useEffect(() => {
    settings.setUrl(store.settings.url);
    settings.setEnableNotificationTooltip(
      store.settings.enableNotificationTooltip
    );
  }, [store.settings]);

  const saveSettings = (shouldClose = true) => {
    store.persistSettings(settings, socket);

    if (shouldClose) {
      history.push('/');
    }
  };

  return (
    <Settings>
      <Picker>
        <AvatarPicker />
        <ColorPicker />
      </Picker>
      <Invite>
        <label>
          Auth-String -{' '}
          <a href="https://figma-chat.vercel.app/" target="_blank">
            Open external Chat
          </a>
        </label>
        <input
          type="text"
          readOnly
          value={Buffer.from(`${store.roomName};${store.secret}`).toString(
            'base64'
          )}
        />
      </Invite>
      <ServerUrl>
        <label htmlFor="server-url">
          Server-URL
          <span
            onClick={() => {
              settings.setUrl(DEFAULT_SERVER_URL);
              saveSettings(settings.url !== store.settings.url);
            }}
          >
            (reset)
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

      <div>
        <ShortcutTiles>
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
        </ShortcutTiles>

        <VersionNote
          target="_blank"
          href="https://github.com/ph1p/figma-chat/blob/master/CHANGELOG.md"
        >
          v{pkg.version}
        </VersionNote>
      </div>
    </Settings>
  );
});

const ServerUrl = styled.div`
  input[type='text'] {
    color: ${(p) => p.theme.brighterInputFont} !important;
  }
`;

const Invite = styled.div`
  margin: 0 0 24px;
`;

const Picker = styled.div`
  display: flex;
  justify-content: space-between;
  width: 125px;
  margin: 0 auto 20px;
`;

const Tile = styled.div<{ name: string }>`
  width: 45px;
  height: 45px;
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${(p) => {
    if (p.name === 'trash') {
      return css`
        svg {
          path {
            fill: ${({ theme }) => theme.thirdFontColor};
            stroke: ${({ theme }) => theme.thirdFontColor};
          }
          path:last-child {
            stroke: ${({ theme }) => theme.secondaryBackgroundColor};
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
  display: flex;
  width: 207px;
  justify-content: space-between;
  margin: 51px auto 84px;
`;

const VersionNote = styled.a`
  position: absolute;
  left: 0;
  text-align: center;
  color: #999 !important;
  font-weight: normal !important;
  bottom: 20px;
  margin-top: 5px;
  width: 100%;
  text-decoration: none;
  font-size: 10px;
  display: block;
  &:hover {
    text-decoration: underline;
  }
`;

const Settings = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
  height: calc(100vh - 37px);
  padding: 49px 32px 0;

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
    color: #000;
    font-weight: bold;
  }
  label {
    margin: 0 0 5px;
    color: #a2adc0;
    text-align: center;
    font-size: 10px;
    display: block;
  }
  input[type='text'] {
    font-size: 14px;
    text-align: center;
    width: 100%;
    border-width: 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.fontColor};
    padding: 8px 18px 9px;
    outline: none;
    border-radius: 7px;
    font-weight: 400;
    &::placeholder {
      color: #999;
    }
    &:focus {
      border-color: #1e1940;
    }
  }
`;

export default SettingsView;
