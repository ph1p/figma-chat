import { computed, observable, action, toJS } from 'mobx';
import { createRef } from 'react';

import SimpleEncryptor from 'simple-encryptor';
import { DEFAULT_SERVER_URL, colors } from '../shared/constants';
import { sendMainMessage } from '../shared/utils';
import { ConnectionEnum } from '../shared/interfaces';

import MessageSound from '../assets/sound.mp3';
import React from 'react';

class RootStore {
  @computed
  get encryptor() {
    return SimpleEncryptor(this.secret);
  }

  @observable
  status = ConnectionEnum.NONE;
  // ---
  @observable
  secret = '';

  @observable
  roomName = '';

  @observable
  instanceId = '';
  // ---
  @observable
  online = [];
  // ---
  @observable
  messages = [];

  @observable
  messagesRef = createRef<HTMLDivElement>();

  @observable
  disableAutoScroll = false;

  @observable
  selection = undefined;

  @computed
  get selectionCount() {
    // fallback
    if (this.selection?.length) {
      return this.selection.length;
    }

    return this.selection?.nodes?.length || 0;
  }

  @action
  scrollToBottom() {
    if (!this.disableAutoScroll) {
      const ref = toJS(this.messagesRef);
      // scroll to bottom
      if (ref?.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
  }

  // ---
  @observable
  isFocused = true;

  @observable
  isMinimized = false;

  @observable
  settings = {
    name: '',
    color: colors['#4F4F4F'],
    url: DEFAULT_SERVER_URL,
    enableNotificationTooltip: true,
    enableNotificationSound: true,
  };

  @observable
  notifications = [];

  @action
  addNotification(text: string, type?: string) {
    this.notifications.push({
      id: Math.random(),
      text,
      type,
    });
  }
  // ---
  @action
  toggleMinimizeChat() {
    this.isMinimized = !this.isMinimized;
    sendMainMessage('minimize', this.isMinimized);
  }

  @action
  clearChatHistory(cb: () => void) {
    if (
      (window as any).confirm('Do you really want to delete the complete chat history? (This cannot be undone)')
    ) {
      sendMainMessage('clear-chat-history');
      this.messages = [];
      cb();
      this.addNotification('Chat history successfully deleted');
    }
  }

  @action
  persistSettings(settings, socket, init?) {
    const oldUrl = this.settings.url;
    this.settings = {
      ...this.settings,
      ...settings,
    };

    // save user settings in main
    sendMainMessage('save-user-settings', Object.assign({}, this.settings));

    if (settings.url && settings.url !== oldUrl) {
      // set server URL
      sendMainMessage('set-server-url', settings.url);

      // re init main app and disconnect socket
      // to prevent multiple sign in
      if (init) {
        if (socket && socket.connected) {
          socket.disconnect();
        }

        init(settings.url);

        this.addNotification('Updated server-URL');
      }
    }

    if (socket && socket.connected) {
      // set user data on server
      socket.emit('set user', this.settings);
    }
  }

  @action
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
