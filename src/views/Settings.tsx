import React, { FunctionComponent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { version, repository } from '../../package.json';
// shared
import { withSocketContext } from '../shared/SocketProvider';
import { DEFAULT_SERVER_URL } from '../shared/constants';
// components
import Checkbox from '../components/Checkbox';
// store
import { observer, useLocalStore } from 'mobx-react';
import { useStore } from '../store';

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
      <Settings>
        <div className="fields">
          <h4>
            Username <Flag reset={setFlag} flags={flags} type="username" />
          </h4>
          <input
            type="text"
            value={settings.name}
            onBlur={() => saveSettings()}
            onChange={({ target }: any) =>
              (settings.name = target.value.substr(0, 20))
            }
            onKeyDown={(e: any) => e.keyCode == 13 && e.target.blur()}
            placeholder="Username ..."
          />
          <br />

          <Checkboxes>
            <Checkbox
              title="Enable tooltips"
              name="notificationTooltipCheckbox"
              checked={settings.enableNotificationTooltip}
              onChange={() => {
                settings.enableNotificationTooltip = !settings.enableNotificationTooltip;
                saveSettings();
              }}
            />
          </Checkboxes>

          <h4>
            Server URL <Flag reset={setFlag} flags={flags} type="url" />
            <span
              onClick={() => {
                settings.url = DEFAULT_SERVER_URL;
                saveSettings(settings.url !== store.settings.url);
              }}
            >
              reset
            </span>
          </h4>

          <input
            type="text"
            value={settings.url}
            onBlur={({ target }: any) =>
              saveSettings(target.value !== store.settings.url)
            }
            onChange={({ target }: any) =>
              (settings.url = target.value.substr(0, 255))
            }
            onKeyDown={(e: any) => e.keyCode == 13 && e.target.blur()}
            placeholder="Server-URL ..."
          />
        </div>

        <div className="delete-history">
          <button
            type="submit"
            onClick={store.removeAllMessages}
            className="button button--secondary"
          >
            Delete history
          </button>
        </div>

        <VersionNote target="_blank" href={repository.url}>
          version: {version}
        </VersionNote>
      </Settings>
    </>
  );
};

const SavedFlag = styled.span`
  background-color: #fff;
  color: #000;
  padding: 4px 7px;
  border-radius: 5px;
`;

const VersionNote = styled.a`
  margin-top: 5px;
  width: 100%;
  color: #fff;
  text-align: right;
  text-decoration: none;
  font-size: 10px;
  display: block;
  &:hover {
    text-decoration: underline;
  }
`;

const Checkboxes = styled.div`
  margin: 35px 0;
  .checkbox__label {
    margin-bottom: 5px;
    &:before {
      margin: 2px 10px 0 0;
    }
  }
`;

const Settings = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
  transform: translateY(-318px);
  height: 362px;
  padding: 20px;
  color: #fff;

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
  input[type='text'] {
    font-size: 11px;
    width: 100%;
    border-width: 0 0 1px 0;
    border-color: #fff;
    border-style: solid;
    background-color: transparent;
    color: #fff;
    padding: 5px 4px;
    outline: none;
  }
  .fields {
    margin-bottom: 20px;
  }

  .delete-history {
    button {
      width: 100%;
      cursor: pointer;
      background-color: #000;
      color: #fff;
      opacity: 0.9;
      &:hover {
        opacity: 1;
      }
    }
  }
  .delete-history {
    margin-top: auto;
    button {
      background-color: rgba(0, 0, 0, 0.3);
      border-color: rgba(0, 0, 0, 0.2);
      margin-bottom: 8px;
    }
  }
`;

export default withSocketContext(observer(SettingsView));
