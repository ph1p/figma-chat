import { EColors } from './constants';

export enum ConnectionEnum {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

export interface NotificationParams {
  id: string;
  text: string;
  type: string;
}

export interface MessageData {
  id: string;
  message: {
    date: string;
    text: string;
    selection?: {
      nodes?: string[];
      page?: {
        name?: string;
      };
    };
  };
  user: {
    name?: string;
    avatar?: string;
    id?: string;
    color: keyof typeof EColors;
    room?: string;
  };
}

export interface StoreSettings {
  name: string;
  avatar: string;
  color: string;
  url: string;
  enableNotificationTooltip: boolean;
  enableNotificationSound: boolean;
  isDarkTheme: boolean;
}
