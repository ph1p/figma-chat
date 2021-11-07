import { EColors } from './constants';

export enum ConnectionEnum {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

export interface CurrentUser {
  color: keyof typeof EColors;
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
  id: string;
  message: {
    date?: string | Date;
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
  user: CurrentUser;
}

export interface StoreSettings {
  url: string;
  enableNotificationTooltip: boolean;
  enableNotificationSound: boolean;
  isDarkTheme: boolean;
}
