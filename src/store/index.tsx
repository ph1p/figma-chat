import { makeAutoObservable, toJS } from 'mobx';
import React, { createRef } from 'react';

import { createEncryptor } from 'simple-encryptor';
import { ConnectionEnum } from '../shared/interfaces';

import MessageSound from '../assets/sound.mp3';
import MessageEmitter from '../shared/MessageEmitter';

const blobToImageString = async (blob) =>
  new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

interface StoreSettings {
  name: string;
  avatar: string;
  color: string;
  url: string;
  enableNotificationTooltip: boolean;
  enableNotificationSound: boolean;
  isDarkTheme: boolean;
}
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

  async setMessages(messages) {
    for (const messageData of messages) {
      if (
        messageData?.message?.selection?.nodes &&
        messageData?.message?.selection.nodes.length === 1
      ) {
        if (!messageData.message.selection.url) {
          const image = (await MessageEmitter.ask(
            'get image',
            toJS(messageData?.message?.selection.nodes)
          )) as any;

          if (image) {
            const blob = new Blob([image], {
              type: 'image/png',
            });
            messageData.message.selection.url = await blobToImageString(blob);
          }
        }
      }
    }
    this.messages = messages;

    setTimeout(() => this.scrollToBottom(), 0);
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

  settings: StoreSettings = {
    name: '',
    avatar: '',
    color: '#4F4F4F',
    url: '',
    enableNotificationTooltip: true,
    enableNotificationSound: true,
    isDarkTheme: false,
  };

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
  // ---
  toggleMinimizeChat() {
    this.isMinimized = !this.isMinimized;
    MessageEmitter.emit('minimize', this.isMinimized);
  }

  clearChatHistory(cb: () => void) {
    if (
      (window as any).confirm(
        'Do you really want to delete the complete chat history? (This cannot be undone)'
      )
    ) {
      MessageEmitter.emit('clear-chat-history');
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
    };

    // save user settings in main
    MessageEmitter.emit('save-user-settings', { ...toJS(this.settings) });

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
            avatar: this.settings.avatar,
            color: this.settings.color,
            name: this.settings.name,
          },
          message: {
            ...data,
          },
        };

        MessageEmitter.emit('add-message-to-history', newMessage);
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
          let text = '';
          if (data.text) {
            text =
              data.text.length > 25
                ? data.text.substr(0, 25 - 1) + '...'
                : data.text;
          }

          MessageEmitter.emit(
            'notification',
            messageData?.user?.name
              ? `${text} · ${messageData.user.avatar} ${messageData.user.name}`
              : `New chat message`
          );
        }
      }

      this.setMessages([...this.messages, newMessage]);

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (e) {
      console.log(e);
    }
  }
}

export const createStore = () => new RootStore();

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
