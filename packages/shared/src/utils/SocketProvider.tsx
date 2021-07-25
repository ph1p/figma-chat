import React, { FunctionComponent } from 'react';
import { Socket } from 'socket.io-client';

interface Props {
  socket: Socket | null;
  children: any;
}

const SocketContext = React.createContext<Socket | null>(null);

export const SocketProvider: FunctionComponent<Props> = (props) => (
  <SocketContext.Provider value={props.socket}>
    {props.children}
  </SocketContext.Provider>
);

export const useSocket = (): Socket | null => {
  const socket = React.useContext(SocketContext);

  if (socket === undefined) {
    throw new Error('useSocket must be used within a SocketProvider.');
  }

  return socket;
};

export const withSocketContext = (Component: any) => (props: any) =>
  (
    <SocketContext.Consumer>
      {(socket) => <Component {...(props as unknown)} socket={socket} />}
    </SocketContext.Consumer>
  );
