import { action, makeAutoObservable, observable, toJS } from 'mobx';
import { AsyncTrunk, ignore } from 'mobx-sync';
import React, { createRef } from 'react';
import { createEncryptor } from 'simple-encryptor';
import { DefaultTheme } from 'styled-components';

import MessageSound from '@fc/shared/assets/sound.mp3';
import { DEFAULT_SERVER_URL } from '@fc/shared/utils/constants';
import {
  ConnectionEnum,
  CurrentUser,
  StoreSettings,
} from '@fc/shared/utils/interfaces';
import { darkTheme, lightTheme } from '@fc/shared/utils/theme';

import EventEmitter from '../shared/EventEmitter';

export class RootStore {
  constructor() {
    makeAutoObservable(this);
  }

  @ignore
  get encryptor() {
    return createEncryptor(this.secret);
  }

  @ignore
  status = ConnectionEnum.NONE;
  @ignore
  online = [];
  @ignore
  messages = [];
  @ignore
  messagesRef = createRef<HTMLDivElement>();

  @ignore
  secret = '';
  @ignore
  roomName = '';
  @ignore
  instanceId = '';

  @ignore
  autoScrollDisabled = false;

  @ignore
  selection = undefined;

  @ignore
  currentUser: CurrentUser = {
    id: '',
    name: '',
    sessionId: '',
    color: '',
    photoUrl: '',
  };

  setStatus(status) {
    this.status = status;
  }

  setCurrentUser(currentUser) {
    this.currentUser = currentUser;
  }

  setSecret(secret) {
    this.secret = secret;
  }
  setRoomName(roomName) {
    this.roomName = roomName;
  }
  setInstanceId(instanceId) {
    this.instanceId = instanceId;
  }
  setOnline(online) {
    this.online = online;
  }
  setMessages(messages) {
    this.messages = messages;
  }
  setMessagesRef(messagesRef) {
    this.messagesRef = messagesRef;
  }
  setAutoScrollDisabled(autoScrollDisabled) {
    this.autoScrollDisabled = autoScrollDisabled;
  }
  setSelection(selection) {
    this.selection = selection;
  }

  disableAutoScroll(disable) {
    this.autoScrollDisabled = disable;
  }

  @ignore
  get theme(): DefaultTheme {
    return this.settings.isDarkTheme ? darkTheme : lightTheme;
  }

  @ignore
  get selectionCount() {
    // fallback
    if (this.selection?.length) {
      return this.selection.length;
    }

    return this.selection?.nodes?.length || 0;
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

  // ---
  @ignore
  isFocused = true;

  @ignore
  isMinimized = false;

  @observable.deep
  settings: Omit<StoreSettings, 'name'> = {
    avatar: '',
    color: '#4F4F4F',
    url: DEFAULT_SERVER_URL,
    enableNotificationTooltip: true,
    enableNotificationSound: true,
    isDarkTheme: false,
  };

  @ignore
  notifications = [];

  setSetting(key: keyof StoreSettings, value: string | boolean) {
    this.settings = {
      ...this.settings,
      [key]: value,
    };
  }

  setIsMinimized(isMinimized: boolean) {
    this.isMinimized = isMinimized;
  }

  setIsFocused(isFocused: boolean) {
    this.isFocused = isFocused;
  }

  setDarkTheme(isDarkTheme) {
    this.settings.isDarkTheme = isDarkTheme;
  }

  addNotification(text: string, type?: string) {
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

  toggleMinimizeChat() {
    this.isMinimized = !this.isMinimized;
    EventEmitter.emit('minimize', this.isMinimized);
  }

  clearChatHistory(cb: () => void) {
    if (
      (window as any).confirm(
        'Do you really want to delete the complete chat history? (This cannot be undone)'
      )
    ) {
      EventEmitter.emit('clear-chat-history');

      this.messages = [];
      cb();
      this.addNotification('Chat history successfully deleted');
    }
  }

  persistSettings(settings, socket?, isInit = false) {
    const oldUrl = this.settings.url;

    this.settings = {
      ...this.settings,
      ...settings,
      figmaId: this.currentUser.id,
      name: this.currentUser.name,
      photoUrl: this.currentUser.photoUrl,
    };

    // save user settings in main
    // EventEmitter.emit('save-user-settings', { ...toJS(this.settings) });

    // set server URL
    if (!isInit && settings.url && settings.url !== oldUrl) {
      this.addNotification('Updated server-URL');
    }

    if (socket && socket.connected) {
      // set user data on server
      socket.emit('set user', this.settings);
    }
  }

  addMessage(messageData) {
    const isLocal = !messageData.user;

    const decryptedMessage = this.encryptor.decrypt(
      isLocal ? messageData : messageData.message
    );

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);
      let newMessage: Record<string, unknown> = {
        message: {
          ...data,
        },
      };

      // is local sender
      if (isLocal) {
        newMessage = {
          id: this.instanceId,
          user: {
            ...this.currentUser,
            avatar: this.settings.avatar,
            color: this.settings.color,
          },
          message: {
            ...data,
          },
        };

        EventEmitter.emit('add-message-to-history', newMessage);
      } else {
        newMessage = {
          id: messageData.id,
          user: messageData.user,
          message: {
            ...data,
          },
        };

        if (data.external) {
          EventEmitter.emit('add-message-to-history', newMessage);
        }

        if (this.settings.enableNotificationSound) {
          const audio = new Audio(MessageSound);
          audio.play();
        }
        if (this.settings.enableNotificationTooltip) {
          let text = '';
          if (data.text) {
            text =
              data.text.length > 25
                ? data.text.substr(0, 25 - 1) + '...'
                : data.text;
          }

          EventEmitter.emit(
            'notification',
            messageData?.user?.name
              ? `${text} · ${messageData.user.avatar} ${messageData.user.name}`
              : `New chat message`
          );
        }
      }

      this.messages.push(newMessage);

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (e) {
      console.log(e);
    }
  }
}

export const rootStore = new RootStore();

const StoreContext = React.createContext<RootStore | null>(null);

export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
);

export const useStore = () => {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};

export const trunk = new AsyncTrunk(rootStore, {
  storageKey: 'figma-chat',
  storage: {
    getItem: (key: string) => {
      EventEmitter.emit('storage get item', key);
      return new Promise((resolve) =>
        EventEmitter.once('storage get item', resolve)
      );
    },
    setItem: (key: string, value: string) => {
      EventEmitter.emit('storage set item', {
        key,
        value,
      });
      return new Promise((resolve) =>
        EventEmitter.once('storage set item', resolve)
      );
    },
    removeItem: (key: string) => {
      EventEmitter.emit('storage remove item', key);
      return new Promise((resolve) =>
        EventEmitter.once('storage remove item', resolve)
      );
    },
  },
});

export const getStoreFromMain = (): Promise<RootStore> =>
  new Promise((resolve) => {
    EventEmitter.emit('storage', 'figma-chat');
    EventEmitter.once('storage', (store) => {
      resolve(JSON.parse(store || '{}'));
    });
  });
