import React, { FunctionComponent } from 'react';

// SocketContext = {Provider, Consumer}
const SocketContext = React.createContext(null);

interface Props {
  socket: SocketIOClient.Socket;
  children: any;
}

export const SocketProvider: FunctionComponent<Props> = (props) => (
  <SocketContext.Provider value={props.socket}>
    {props.children}
  </SocketContext.Provider>
);

export const useSocket = (): SocketIOClient.Socket => {
  const socket = React.useContext(SocketContext);

  if (typeof socket === 'undefined') {
    throw new Error('useSocket must be used within a SocketProvider.');
  }
  return socket;
};

export const withSocketContext = (Component) => (props) => (
  <SocketContext.Consumer>
    {(socket) => <Component {...(props as unknown)} socket={socket} />}
  </SocketContext.Consumer>
);
