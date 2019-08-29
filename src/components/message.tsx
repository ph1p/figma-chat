import * as React from 'react';
import { sendMainMessage, colors } from '../utils';

export default function Message({ data, instanceId }) {
  const username = data.user.name || '';
  const colorClass = colors[data.user.color] || 'blue';

  return (
    <div
      className={`message ${
        data.id === instanceId
          ? 'me'
          : colorClass
      }`}
    >
      {data.id !== instanceId ? <div className="user">{username}</div> : ''}
      {data.message.selection ? (
        <span
          onClick={() =>
            sendMainMessage('focus-nodes', {
              ids: data.message.selection
            })
          }
        >
          {data.message.text}
          <button className="selection button button--secondary">
            attached elements
          </button>
        </span>
      ) : (
        <span>{data.message.text}</span>
      )}
    </div>
  );
}
