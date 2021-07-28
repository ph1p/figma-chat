import { makeAutoObservable, toJS } from 'mobx';
import { AsyncTrunk, ignore } from 'mobx-sync';
import React, { FunctionComponent, createRef } from 'react';
import { createEncryptor } from 'simple-encryptor';
import { DefaultTheme } from 'styled-components';

import { EColors } from '@shared/utils/constants';
import {
  ConnectionEnum,
  MessageData,
  StoreSettings,
} from '@shared/utils/interfaces';
import { darkTheme, lightTheme } from '@shared/utils/theme';

class RootStore {
  settings: StoreSettings = {
    name: 'Test',
    avatar: '',
    color: '#4F4F4F',
    url: 'https://figma-chat.ph1p.dev',
    enableNotificationTooltip: true,
    enableNotificationSound: true,
    isDarkTheme: false,
  };
  messages: any[] = [];

  room = '';
  secret = '';

  @ignore
  instanceId = '';

  @ignore
  status = ConnectionEnum.NONE;

  @ignore
  online: any[] = [];

  @ignore
  messagesRef = createRef<HTMLDivElement>();

  @ignore
  autoScrollDisabled = false;

  constructor() {
    makeAutoObservable(this);
  }

  disableAutoScroll(autoScrollDisabled: boolean) {
    this.autoScrollDisabled = autoScrollDisabled;
  }

  setStatus(status: ConnectionEnum) {
    this.status = status;
  }

  setInstanceId(instanceId: string) {
    this.instanceId = instanceId;
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

  persistSettings(settings: any, socket?: any, isInit = false) {
    const oldUrl = this.settings.url;

    this.settings = {
      ...this.settings,
      ...settings,
    };

    // set server URL
    if (!isInit && settings.url && settings.url !== oldUrl) {
      // this.addNotification('Updated server-URL');
    }

    if (socket && socket.connected) {
      // set user data on server
      socket.emit('set user', this.settings);
    }
  }

  addLocalMessage(messageData: string) {
    const decryptedMessage = this.encryptor.decrypt(messageData);

    try {
      const data = JSON.parse(decryptedMessage);
      const newMessage: MessageData = {
        id: this.instanceId,
        user: {
          avatar: this.settings.avatar,
          color: this.settings.color as keyof typeof EColors,
          name: this.settings.name,
        },
        message: {
          ...data,
        },
      };

      this.messages.push(newMessage);

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (e) {
      console.log(e);
    }
  }

  addReceivedMessage(messageData: MessageData) {
    const decryptedMessage = this.encryptor.decrypt(
      messageData.message as unknown as string
    );

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);
      const newMessage: MessageData = {
        id: messageData.id,
        user: messageData.user,
        message: {
          ...data,
        },
      };

      this.messages.push(newMessage);

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

export const StoreProvider: FunctionComponent = (props) => {
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
