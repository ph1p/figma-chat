import { makeAutoObservable, toJS } from 'mobx';
import React, { createRef } from 'react';

import { createEncryptor } from 'simple-encryptor';
import { ConnectionEnum } from '../shared/interfaces';
import { sendMainMessage } from '../shared/utils';

import MessageSound from '../assets/sound.mp3';

class RootStore {
  constructor() {
    makeAutoObservable(this);
  }

  get encryptor() {
    return createEncryptor(this.secret);
  }

  status = ConnectionEnum.NONE;
  secret = '';
  roomName = '';
  instanceId = '';
  online = [];
  messages = [];
  messagesRef = createRef<HTMLDivElement>();
  autoScrollDisabled = false;
  selection = undefined;

  setStatus(status) {
    this.status = status;
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
  isFocused = true;

  isMinimized = false;

  settings = {
    name: '',
    avatar: '',
    color: '#4F4F4F',
    url: '',
    enableNotificationTooltip: true,
    enableNotificationSound: true,
    isDarkTheme: false,
  };

  notifications = [];

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
  // ---
  toggleMinimizeChat() {
    this.isMinimized = !this.isMinimized;
    sendMainMessage('minimize', this.isMinimized);
  }

  clearChatHistory(cb: () => void) {
    if (
      (window as any).confirm(
        'Do you really want to delete the complete chat history? (This cannot be undone)'
      )
    ) {
      sendMainMessage('clear-chat-history');
      this.messages = [];
      cb();
      this.addNotification('Chat history successfully deleted');
    }
  }

  persistSettings(settings, socket, isInit = false) {
    const oldUrl = this.settings.url;

    this.settings = {
      ...this.settings,
      ...settings,
    };

    // save user settings in main
    sendMainMessage('save-user-settings', { ...toJS(this.settings) });

    // set server URL
    if (!isInit && settings.url && settings.url !== oldUrl) {
      sendMainMessage('set-server-url', settings.url);
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
      let newMessage: {} = {
        message: {
          ...data,
        },
      };

      // is local sender
      if (isLocal) {
        newMessage = {
          id: this.instanceId,
          user: {
            avatar: this.settings.avatar,
            color: this.settings.color,
            name: this.settings.name,
          },
          message: {
            ...data,
          },
        };

        sendMainMessage('add-message-to-history', newMessage);
      } else {
        newMessage = {
          id: messageData.id,
          user: messageData.user,
          message: {
            ...data,
          },
        };

        if (this.settings.enableNotificationSound) {
          const audio = new Audio(MessageSound);
          audio.play();
        }
        if (this.settings.enableNotificationTooltip) {
          sendMainMessage(
            'notification',
            messageData?.user?.name
              ? `New chat message from ${messageData.user.name}`
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

export function createStore() {
  return new RootStore();
}

export type TStore = ReturnType<typeof createStore>;

const StoreContext = React.createContext<TStore | null>(null);

export const StoreProvider = ({ children }) => {
  const store = createStore();
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};
