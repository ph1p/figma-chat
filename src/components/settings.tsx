import { useState } from 'react';
import * as React from 'react';
import { sendMainMessage, colors } from '../helpers';

export default function Settings(props) {
  const closeSettings = () => props.setSettingsView(false);

  const [settings, setSettings] = useState({
    ...props.settings,
    user: {
      ...props.settings.user
    }
  });

  const saveSettings = () => {
    sendMainMessage('save-settings', settings);

    props.setSettingsView(false);
  };

  return (
    <div className="settings">
      <div className="fields">
        <input
          type="input"
          value={settings.user.name}
          onChange={e =>
            setSettings({
              ...settings,
              user: {
                ...settings.user,
                name: e.target.value
              }
            })
          }
          className="input"
          placeholder="Username ..."
        />
        <br />

        <div className="colors">
          {Object.keys(colors).map(color => (
            <div
              key={color}
              onClick={() =>
                setSettings({
                  ...settings,
                  user: {
                    ...settings.user,
                    color
                  }
                })
              }
              className={`color ${settings.user.color === color && ' active'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* <input
          type="input"
          value={settings.url}
          onChange={e =>
            setSettings({
              ...settings,
              url: e.target.value
            })
          }
          className="input"
          placeholder="Server-URL ..."
        /> */}
      </div>

      <div className="footer">
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
