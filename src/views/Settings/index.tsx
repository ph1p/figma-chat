// store
import { observer, useLocalStore } from 'mobx-react';
import React, { useEffect, useState, FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { version } from '../../../package.json';
import BellIcon from '../../assets/icons/Bell';
import MessageIcon from '../../assets/icons/Message';
import ThemeIcon from '../../assets/icons/Theme';
import TrashIcon from '../../assets/icons/Trash';
// components
import Header from '../../components/Header';
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

const Flag = (props) => {
  return props.flags[props.type] ? (
    <SavedFlag
      onClick={() =>
        props.reset({
          ...props.flags,
          [props.type]: false,
        })
      }
    >
      saved!
    </SavedFlag>
  ) : null;
};

const SettingsView: FunctionComponent<SettingsProps> = (props) => {
  const store = useStore();

  const [flags, setFlag] = useState({
    username: false,
  });

  const history = useHistory();
  const settings = useLocalStore(() => ({
    name: '',
    url: '',
    enableNotificationTooltip: true,
  }));

  useEffect(() => {
    if (store.isMinimized) {
      store.toggleMinimizeChat();
    }

    return () =>
      setFlag({
        username: true,
      });
  }, []);

  useEffect(() => {
    settings.name = store.settings.name;
    settings.url = store.settings.url;
    settings.enableNotificationTooltip =
      store.settings.enableNotificationTooltip;
  }, [store.settings]);

  const saveSettings = (shouldClose: boolean = true) => {
    if (store.settings.name !== settings.name) {
      setFlag({
        ...flags,
        username: true,
      });
    }

    store.persistSettings(settings, props.socket);

    if (shouldClose) {
      history.push('/');
    }
  };

  return (
    <>
      <Header />
      <Settings>
        <Picker>
          <AvatarPicker />
          <ColorPicker />
        </Picker>

        <div>
          <label>
            Username <Flag reset={setFlag} flags={flags} type="username" />
          </label>
          <input
            type="text"
            value={settings.name}
            onBlur={() => saveSettings(false)}
            onChange={({ target }: any) =>
              (settings.name = target.value.substr(0, 20))
            }
            onKeyDown={(e: any) => e.keyCode === 13 && e.target.blur()}
          />
        </div>
        <div>
          <label htmlFor="server-url">
            Server-URL <Flag reset={setFlag} flags={flags} type="url" />
            <span
              onClick={() => {
                settings.url = DEFAULT_SERVER_URL;
                saveSettings(settings.url !== store.settings.url);
              }}
            >
              reset
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
              (settings.url = target.value.substr(0, 255))
            }
            onKeyDown={(e: any) => e.keyCode === 13 && e.target.blur()}
          />
        </div>

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
                      settings.enableNotificationTooltip = !settings.enableNotificationTooltip;
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
                      store.settings.isDarkTheme = !store.settings.isDarkTheme;
                      saveSettings(false);
                    }}
                  >
                    <ThemeIcon active={!store.settings.isDarkTheme} />
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
            v{version}
          </VersionNote>
        </div>
      </Settings>
    </>
  );
};

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
          path:last-child {
            stroke: ${({ theme }) => theme.secondaryBackgroundColor};
          }
        }
      `;
    }

    if (p.name === 'bell' || p.name === 'message') {
      return css`
        svg {
          path {
            stroke: ${({ theme }) => theme.secondaryBackgroundColor};
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
  margin: 0 auto;
`;

const SavedFlag = styled.span`
  background-color: #fff;
  color: #000;
  padding: 4px 7px;
  border-radius: 5px;
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
  padding: 34px;

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
    margin: 5px 0;
    color: #a2adc0;
    text-align: center;
    font-size: 10px;
    display: block;
  }
  input[type='text'] {
    font-size: 16px;
    text-align: center;
    width: 100%;
    border-width: 1px;
    border-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-style: solid;
    background-color: transparent;
    color: ${(p) => p.theme.fontColor};
    padding: 9px 18px;
    outline: none;
    border-radius: 7px;
    &::placeholder {
      color: #999;
    }
    &:focus {
      border-color: #1e1940;
    }
  }
`;

export default withSocketContext(observer(SettingsView));
