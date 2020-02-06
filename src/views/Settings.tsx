import React, { FunctionComponent, useEffect } from 'react';
import { store } from 'react-easy-state';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import { ConnectionEnum } from '../shared/interfaces';
import { withSocketContext } from '../shared/SocketProvider';
import { state, view } from '../shared/state';
import { colors, DEFAULT_SERVER_URL } from '../shared/constants';
import { version, repository } from '../../package.json';

interface SettingsProps {
  socket: SocketIOClient.Socket;
  init?: (serverUrl: any) => void;
}

const SettingsView: FunctionComponent<SettingsProps> = props => {
  const isConnected = state.status === ConnectionEnum.CONNECTED;

  const history = useHistory();
  const settings = store({
    color: '',
    name: '',
    url: ''
  });

  useEffect(() => {
    if (state.isMinimized) {
      state.toggleMinimizeChat();
    }
  }, []);

  const saveSettings = () => {
    if (
      state.settings.name !== settings.name ||
      state.settings.color !== settings.color
    ) {
      state.addNotification('Successfully updated settings', 'success');
    }

    state.persistSettings(settings, props.socket, props.init);

    if (isConnected) {
      history.push('/');
    }
  };

  useEffect(() => {
    settings.name = state.settings.name;
    settings.color = state.settings.color;
    settings.url = state.settings.url;
  }, [settings]);

  return (
    <>
      <Header
        title="Settings"
        backButton
        right={
          isConnected && (
            <DeleteHistory onClick={state.removeAllMessages}>
              <div>Delete history</div>
              <div className="icon icon--trash"></div>
            </DeleteHistory>
          )
        }
      />
      <Settings>
        <div className="fields">
          <input
            type="input"
            value={settings.name}
            onChange={({ target }: any) =>
              (settings.name = target.value.substr(0, 20))
            }
            className="input"
            placeholder="Username ..."
          />
          <br />

          <h4>Your bubble color</h4>
          <div className="colors">
            {Object.keys(colors).map(color => (
              <div
                key={color}
                onClick={() => (settings.color = color)}
                className={`color ${settings.color === color && ' active'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <h4>
            Server URL
            <p onClick={() => (settings.url = DEFAULT_SERVER_URL)}>
              default: {DEFAULT_SERVER_URL}
            </p>
          </h4>

          <input
            type="input"
            value={settings.url}
            onChange={({ target }: any) =>
              (settings.url = target.value.substr(0, 255))
            }
            className="input"
            placeholder="Server-URL ..."
          />
        </div>

        <div className="save-button">
          <button
            type="submit"
            onClick={saveSettings}
            className="button button--secondary"
          >
            save
          </button>
        </div>
        <VersionNote target="_blank" href={repository.url}>
          version: {version}
        </VersionNote>
      </Settings>
    </>
  );
};

const VersionNote = styled.a`
  position: absolute;
  right: 20px;
  bottom: 6px;
  color: #999;
  text-align: right;
  text-decoration: none;
  font-size: 10px;
  &:hover {
    text-decoration: underline;
  }
`;
const DeleteHistory = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 5px;
  height: 21px;
  padding: 0 0 0 10px;
  border-radius: 5px;
  .icon {
    width: 31px;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
`;

const Settings = styled.div`
  padding: 20px;

  h4 {
    margin: 0 0 15px;
  }
  p {
    color: #999;
    margin: 0;
    font-size: 10px;
  }
  .fields {
    margin-bottom: 20px;
  }
  .save-button {
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
  .colors {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-gap: 21px 9px;
    margin-bottom: 30px;
    .color {
      position: relative;
      width: 28px;
      height: 44px;
      border-radius: 19px;
      cursor: pointer;
      &:hover::after {
        content: '';
        bottom: -12px;
        opacity: 1;
      }
      &.active::after {
        content: '';
        bottom: -12px;
        opacity: 1;
        background-color: #000;
      }
      &:hover::after {
        background-color: #999;
      }
      &::after {
        content: '';
        transition: all 0.3s;
        opacity: 0;
        bottom: -5px;

        left: 12.5px;
        position: absolute;
        border-radius: 100%;
        width: 4px;
        height: 4px;
      }
    }
  }
`;

export default withSocketContext(view(SettingsView));
