import { useState } from 'react';
import * as React from 'react';
import { sendMainMessage, colors, DEFAULT_SERVER_URL } from '../utils';

export default function Settings(props) {
  const closeSettings = () => props.setSettingsView(false);

  const [url, setUrl] = useState(props.url);
  const [settings, setSettings] = useState({
    ...props.settings
  });

  const saveSettings = () => {
    sendMainMessage('save-user-settings', settings);

    if (url && url !== props.url) {
      sendMainMessage('set-server-url', url);
    }

    props.setSettingsView(false);
  };

  const removeAllMessages = () => {
    if (confirm('Remove all messages? (This cannot be undone)')) {
      sendMainMessage('remove-all-messages');
      alert('Messages successfully removed');
    }
  };

  return (
    <div className="settings">
      <div className="fields">
        <h4>Name</h4>
        <input
          type="input"
          value={settings.name}
          onChange={e =>
            setSettings({
              ...settings,
              name: e.target.value.substr(0, 20)
            })
          }
          className="input"
          placeholder="Username ..."
        />
        <br />

        <h4>Color</h4>
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
          onChange={e => setUrl(e.target.value.substr(0, 255))}
          className="input"
          placeholder="Server-URL ..."
        />
      </div>

      <div className="footer">
        <button
          type="button"
          onClick={removeAllMessages}
          className="remove-all-messages button button--secondary-destructive"
        >
          remove all messages
        </button>
        <button
          type="submit"
          onClick={saveSettings}
          className="button button--primary"
        >
          save
        </button>
        <button
          type="button"
          onClick={closeSettings}
          className="button button--secondary"
        >
          cancel
        </button>
      </div>
    </div>
  );
}
