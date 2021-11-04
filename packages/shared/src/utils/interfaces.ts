import { EColors } from './constants';

export enum ConnectionEnum {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

export interface CurrentUser {
  color?: string;
  id: string;
  name?: string;
  photoUrl?: string;
  avatar?: string;
  sessionId?: string;
}

export interface NotificationParams {
  id: number;
  text: string;
  type: string;
}

export interface MessageData {
  message: {
    date: string;
    text: string;
    giphy?: string;
    external?: any;
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
    id: string;
    color: keyof typeof EColors;
    room?: string;
    photoUrl?: string;
  };
}

export interface StoreSettings {
  url: string;
  enableNotificationTooltip: boolean;
  enableNotificationSound: boolean;
  isDarkTheme: boolean;
}
