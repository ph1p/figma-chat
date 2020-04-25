import React, { FunctionComponent, useEffect, useState } from 'react';
import { store } from 'react-easy-state';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { version, repository } from '../../package.json';
// shared
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/SocketProvider';
import { state, view } from '../shared/state';
import { DEFAULT_SERVER_URL } from '../shared/constants';
// components
import Checkbox from '../components/Checkbox';

interface SettingsProps {
  socket: SocketIOClient.Socket;
  init?: (serverUrl: any) => void;
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
  const [flags, setFlag] = useState({
    username: false,
  });

  const history = useHistory();
  const settings = store({
    name: '',
    url: '',
    enableNotificationTooltip: true,
  });

  useEffect(() => {
    if (state.isMinimized) {
      state.toggleMinimizeChat();
    }

    return () =>
      setFlag({
        username: true,
      });
  }, []);

  useEffect(() => {
    settings.name = state.settings.name;
    settings.url = state.settings.url;
    settings.enableNotificationTooltip =
      state.settings.enableNotificationTooltip;
  }, [state.settings]);

  const saveSettings = (shouldClose: boolean = true) => {
    if (state.settings.name !== settings.name) {
      setFlag({
        ...flags,
        username: true,
      });
    }

    state.persistSettings(settings, props.socket, props.init);

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
            onBlur={() => saveSettings(false)}
            onChange={({ target }: any) =>
              (settings.name = target.value.substr(0, 20))
            }
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
                saveSettings(false);
              }}
            />
          </Checkboxes>

          <h4>
            Server URL <Flag reset={setFlag} flags={flags} type="url" />
            <span onClick={() => (settings.url = DEFAULT_SERVER_URL)}>
              reset
            </span>
          </h4>

          <input
            type="text"
            value={settings.url}
            onBlur={() => saveSettings()}
            onChange={({ target }: any) =>
              (settings.url = target.value.substr(0, 255))
            }
            placeholder="Server-URL ..."
          />
        </div>

        <div className="delete-history">
          <button
            type="submit"
            onClick={state.removeAllMessages}
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

export default withSocketContext(view(SettingsView));
