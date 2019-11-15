import React, { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { sendMainMessage, colors, DEFAULT_SERVER_URL } from '../utils';
import { view, state } from '../shared/state';
import Header from '../components/header';

const SettingsScreen: FunctionComponent = () => {
  const history = useHistory();

  const [url, setUrl] = useState(state.url);
  const [settings, setSettings] = useState({
    ...state.settings
  });

  const saveSettings = () => {
    sendMainMessage('save-user-settings', settings);

    if (url && url !== state.url) {
      sendMainMessage('set-server-url', url);
    }
    history.push('/');
  };

  const removeAllMessages = () => {
    if (
      (window as any).confirm('Remove all messages? (This cannot be undone)')
    ) {
      sendMainMessage('remove-all-messages');
      (window as any).alert('Messages successfully removed');
    }
  };

  return (
    <>
      <Header
        title="Settings"
        backButton
        right={
          <DeleteHistory onClick={removeAllMessages}>
            <div>Delete history</div>
            <div className="icon icon--trash"></div>
          </DeleteHistory>
        }
      />
      <Settings>
        <div className="fields">
          <input
            type="input"
            value={settings.name}
            onChange={({ target }: any) =>
              setSettings({
                ...settings,
                name: target.value.substr(0, 20)
              })
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
                onClick={() =>
                  setSettings({
                    ...settings,
                    color
                  })
                }
                className={`color ${settings.color === color && ' active'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <h4>
            Server URL (requires restart)
            <p onClick={() => setUrl(DEFAULT_SERVER_URL)}>
              default: {DEFAULT_SERVER_URL}
            </p>
          </h4>

          <input
            type="input"
            value={url}
            onChange={({ target }: any) => setUrl(target.value.substr(0, 255))}
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
      </Settings>
    </>
  );
};

const DeleteHistory = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
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
      &:hover::after,
      &.active::after {
        content: '';
        bottom: -12px;
        opacity: 1;
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

export default view(SettingsScreen);
