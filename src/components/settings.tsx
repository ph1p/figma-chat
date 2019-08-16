import { useState, useEffect, useRef } from 'react';
import * as React from 'react';

export default function Settings(props) {
  const closeSettings = () => props.setSettingsView(false);

  return (
    <div className="settings">
      <div className="fields">
        <input
          type="input"
          value={props.currentUser.name}
          className="input"
          placeholder="Username ..."
        />
        <br />

        <input
          type="input"
          value={props.currentUser.color}
          className="input"
          placeholder="Color ..."
        />
        <br />

        <input type="input" className="input" placeholder="Server-URL ..." />
      </div>

      <div className="footer">
        <button
          type="submit"
          onClick={closeSettings}
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
