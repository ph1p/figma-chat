// store
import { observer, useLocalObservable } from 'mobx-react';
import React, { useEffect, useRef, FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import pkg from '../../../package.json';
import BellIcon from '../../assets/icons/BellIcon';
import MessageIcon from '../../assets/icons/MessageIcon';
import ThemeIcon from '../../assets/icons/ThemeIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
// components
import Tooltip from '../../components/Tooltip';
// shared
import { withSocketContext } from '../../shared/SocketProvider';
import { DEFAULT_SERVER_URL } from '../../shared/constants';
import { useStore } from '../../store';
import AvatarPicker from './components/AvatarPicker';
import ColorPicker from './components/ColorPicker';

interface SettingsProps {
  socket: SocketIOClient.Socket;
}

const SettingsView: FunctionComponent<SettingsProps> = (props) => {
  const store = useStore();

  const nameInputRef = useRef(null);
  const history = useHistory();
  const settings = useLocalObservable(() => ({
    name: '',
    url: '',
    enableNotificationTooltip: true,
    setUrl(url) {
      this.url = url;
    },
    setName(name) {
      this.name = name;
    },
    setEnableNotificationTooltip(flag) {
      this.enableNotificationTooltip = flag;
    },
  }));

  useEffect(() => {
    if (store.isMinimized) {
      store.toggleMinimizeChat();
    }
    if (!store.settings.name) {
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    settings.setName(store.settings.name);
    settings.setUrl(store.settings.url);
    settings.setEnableNotificationTooltip(
      store.settings.enableNotificationTooltip
    );
  }, [store.settings]);

  const saveSettings = (shouldClose = true) => {
    if (store.settings.name !== settings.name) {
      store.addNotification(`Name successfully updated`);
    }

    store.persistSettings(settings, props.socket);

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

      <Username>
        <label>Username</label>
        <input
          type="text"
          ref={nameInputRef}
          value={settings.name}
          onBlur={() => saveSettings(false)}
          onChange={({ target }: any) =>
            settings.setName(target.value.substr(0, 20))
          }
          onKeyDown={(e: any) => e.keyCode === 13 && e.target.blur()}
        />
      </Username>
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
              React.forwardRef((_, ref) => (
                <Tile
                  name="trash"
                  ref={ref}
                  onClick={() =>
                    store.clearChatHistory(() => saveSettings(true))
                  }
                >
                  <TrashIcon />
                </Tile>
              ))
            )}
          >
            History
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              React.forwardRef((_, ref) => (
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
              ))
            )}
          >
            Notifications
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              React.forwardRef((_, ref) => (
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
              ))
            )}
          >
            Theme
          </Tooltip>
          <Tooltip
            hover
            handler={observer(
              React.forwardRef((_, ref) => (
                <Tile
                  name="bell"
                  ref={ref}
                  onClick={() => {
                    store.settings.enableNotificationSound = !store.settings
                      .enableNotificationSound;
                    saveSettings(false);
                  }}
                >
                  <BellIcon active={store.settings.enableNotificationSound} />
                </Tile>
              ))
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
};

const ServerUrl = styled.div`
  input[type='text'] {
    color: ${(p) => p.theme.brighterInputFont} !important;
  }
`;

const Username = styled.div`
  margin: 44px 0 34px;
`;

const Picker = styled.div`
  display: flex;
  justify-content: space-between;
  width: 125px;
  margin: 0 auto;
`;

const Tile = styled.div`
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
  margin: 51px auto 64px;
`;

const VersionNote = styled.a`
  position: absolute;
  left: 0;
  text-align: center;
  color: #999;
  bottom: 10px;
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

export default withSocketContext(observer(SettingsView));
