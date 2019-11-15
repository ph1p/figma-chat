declare function require(path: string): any;
const IS_PROD = true;

export enum ConnectionEnum {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING'
}

export enum SelectionStateEnum {
  READY = 'READY',
  NONE = 'NONE',
  LOADING = 'LOADING'
}

export interface MessageData {
  message: string;
  id: string;
  user: {
    name?: string;
    id?: string;
    color?: string;
    room?: string;
  };
}
