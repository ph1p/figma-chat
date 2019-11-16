import React, { FunctionComponent } from 'react';

// SocketContext = {Provider, Consumer}
const SocketContext = React.createContext(null);

interface Props {
  socket: SocketIOClient.Socket;
  children: any;
}

export const SocketProvider: FunctionComponent<Props> = props => {
  return (
    <SocketContext.Provider value={props.socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export function withSocketContext(Component) {
  class ComponentWithSocket extends React.Component {
    static displayName = `${Component.displayName || Component.name}`;

    render() {
      return (
        <SocketContext.Consumer>
          {socket => (
            <Component
              {...this.props}
              socket={socket}
              ref={(this.props as any).onRef}
            />
          )}
        </SocketContext.Consumer>
      );
    }
  }

  return ComponentWithSocket;
}
