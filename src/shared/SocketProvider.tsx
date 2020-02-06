import React, { FunctionComponent } from 'react';
import PropTypes from 'prop-types';

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

export const withSocketContext = <Comp extends React.ComponentType<any>>(
  Component: Comp
): React.ComponentClass<any> => {
  return class ComponentWithSocket extends React.Component<any> {
    static propTypes = {
      Component: PropTypes.element
    };

    static displayName = `${Component.displayName || Component.name}`;

    render() {
      return (
        <SocketContext.Consumer>
          {socket => <Component {...(this.props as any)} socket={socket} />}
        </SocketContext.Consumer>
      );
    }
  };
};
