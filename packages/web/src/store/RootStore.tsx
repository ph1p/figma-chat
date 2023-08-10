import { makeAutoObservable, toJS } from 'mobx';
import { AsyncTrunk, ignore } from 'mobx-sync';
import React, { FunctionComponent, createRef, PropsWithChildren } from 'react';
import { createEncryptor } from 'simple-encryptor';
import { Socket } from 'socket.io-client';
import { DefaultTheme } from 'styled-components';

import { DEFAULT_SERVER_URL } from '@fc/shared/utils/constants';
import {
  ConnectionEnum,
  CurrentUser,
  MessageData,
  NotificationParams,
  StoreSettings,
} from '@fc/shared/utils/interfaces';
import { darkTheme, lightTheme } from '@fc/shared/utils/theme';

class RootStore {
  settings: StoreSettings = {
    url: DEFAULT_SERVER_URL,
    enableNotificationTooltip: true,
    enableNotificationSound: true,
    isDarkTheme: false,
  };

  messages: any[] = [];

  room = '';
  secret = '';

  currentUser: CurrentUser = {
    id: '',
    name: 'Anon',
    avatar: '🦊',
    color: '#4F4F4F',
  };

  @ignore
  status = ConnectionEnum.NONE;

  @ignore
  online: any[] = [];

  @ignore
  messagesRef = createRef<HTMLDivElement>();

  @ignore
  autoScrollDisabled = false;

  @ignore
  notifications: NotificationParams[] = [];

  @ignore
  figmaEditorType = '';

  constructor() {
    makeAutoObservable(this);
  }

  addNotification(text: string, type: string = '') {
    this.notifications.push({
      id: Math.random(),
      text,
      type,
    });
  }

  deleteNotification(id: number) {
    this.notifications.splice(
      this.notifications.findIndex((n) => n.id === id),
      1
    );
  }

  clearChatHistory() {
    this.messages = [];
    this.addNotification('History cleared');
  }

  disableAutoScroll(autoScrollDisabled: boolean) {
    this.autoScrollDisabled = autoScrollDisabled;
  }

  setStatus(status: ConnectionEnum) {
    this.status = status;
  }

  setCurrentUser(currentUser: Partial<CurrentUser>) {
    this.currentUser = {
      ...this.currentUser,
      ...currentUser,
    };
  }

  setMessagesRef(messagesRef: HTMLDivElement) {
    this.messagesRef = {
      current: messagesRef,
    };
  }

  setIsDarkTheme(isDarkTheme: boolean) {
    this.settings.isDarkTheme = isDarkTheme;
  }

  setRoom(room: string) {
    this.room = room;
  }

  setSecret(secret: string) {
    this.secret = secret;
  }

  setOnline(online: any[]) {
    this.online = online;
  }

  setSetting(key: keyof StoreSettings, value: string | boolean) {
    this.settings = {
      ...this.settings,
      [key]: value,
    };
  }

  persistSettings(settings: any, isInit = false) {
    const oldUrl = this.settings.url;

    this.settings = {
      ...this.settings,
      ...settings,
    };

    // set server URL
    if (!isInit && settings.url && settings.url !== oldUrl) {
      this.addNotification('Updated server-URL');
    }
  }

  persistCurrentUser(currentUser: Partial<CurrentUser>, socket?: any) {
    this.setCurrentUser(currentUser);

    if (socket && socket.connected) {
      // set user data on server
      socket.emit('set user', toJS(this.currentUser));
    }
  }

  removeMessage(messageId: string) {
    this.messages = this.messages.filter((message) =>
      message?.id ? message?.id !== messageId : true
    );
  }

  addLocalMessage(messageData: Partial<MessageData>, socket: Socket) {
    if (!messageData) return;

    try {
      // generate messageId
      messageData.id = (new Date().getTime() * Math.random() * 10000).toString(
        32
      );
      if (messageData.message) {
        messageData.message.date = new Date().toString();
      }

      const newMessage: Partial<MessageData> = {
        ...messageData,
        user: toJS(this.currentUser),
      };

      socket.emit('chat message', {
        roomName: this.room,
        message: this.encryptor.encrypt(JSON.stringify(newMessage)),
      });

      this.messages.push(newMessage);

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (e) {
      console.log(e);
    }
  }

  addReceivedMessage(messageData: Partial<MessageData>) {
    // silent on error
    try {
      const decryptedMessage = this.encryptor.decrypt(messageData as string);
      const data = JSON.parse(decryptedMessage);

      this.messages.push(data);

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (e) {
      console.log(e);
    }
  }

  scrollToBottom() {
    if (!this.autoScrollDisabled) {
      const ref = toJS(this.messagesRef);
      // scroll to bottom
      if (ref?.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
  }

  get theme(): DefaultTheme {
    return this.settings.isDarkTheme ? darkTheme : lightTheme;
  }

  get encryptor() {
    return createEncryptor(this.secret);
  }
}

const rootStore = new RootStore();

export const trunk = new AsyncTrunk(rootStore, {
  storage: localStorage,
  storageKey: 'figma-chat',
});

const StoreContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent<PropsWithChildren> = (props) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {props.children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(StoreContext);

  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};

export default rootStore;
