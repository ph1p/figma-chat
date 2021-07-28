import { useStore } from '@web/store/RootStore';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { useSocket } from '@shared/utils/SocketProvider';
import { ConnectionEnum } from '@shared/utils/interfaces';

export const Login = observer(() => {
  const store = useStore();
  const socket = useSocket();
  const [room, setRoom] = useState('');
  const [secret, setSecret] = useState('');

  const enterRoom = () => {
    if (socket) {
      store.setSecret(secret);
      store.setRoom(room);

      socket.connect();
    }
  };

  if (store.status !== ConnectionEnum.CONNECTED) {
    return store.status === ConnectionEnum.ERROR
      ? 'connection failed 🙈'
      : 'connecting...';
  }

  return (
    <div>
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.currentTarget.value)}
      />
      <input
        type="text"
        value={secret}
        onChange={(e) => setSecret(e.currentTarget.value)}
      />

      <button onClick={enterRoom}>Enter Room</button>
    </div>
  );
});
