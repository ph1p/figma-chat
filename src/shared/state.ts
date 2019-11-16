import { createRef } from 'react';
import { store, view } from 'react-easy-state';
import SimpleEncryptor from 'simple-encryptor';
import { DEFAULT_SERVER_URL } from './constants';
import { sendMainMessage } from './utils';
import { ConnectionEnum } from './interfaces';

const state = store({
  get encryptor() {
    return SimpleEncryptor(state.secret);
  },
  status: ConnectionEnum.NONE,
  // ---
  secret: '',
  roomName: '',
  instanceId: '',
  // ---
  online: [],
  // ---
  messages: [],
  messagesRef: createRef(),
  disableAutoScroll: false,
  scrollToBottom() {
    if (!state.disableAutoScroll) {
      // scroll to bottom
      if (state.messagesRef.current) {
        state.messagesRef.current.scrollTop =
          state.messagesRef.current.scrollHeight;
      }
    }
  },
  // ---
  isFocused: true,
  isMinimized: false,
  settings: {
    name: '',
    color: '',
    url: DEFAULT_SERVER_URL
  },
  // ---
  toggleMinimizeChat() {
    state.isMinimized = !state.isMinimized;
    sendMainMessage('minimize', state.isMinimized);
  },
  removeAllMessages() {
    if (
      (window as any).confirm('Remove all messages? (This cannot be undone)')
    ) {
      sendMainMessage('remove-all-messages');
      (window as any).alert('Messages successfully removed');
      state.messages = [];
    }
  },
  persistSettings(settings, socket) {
    sendMainMessage('save-user-settings', Object.assign({}, settings));

    state.settings = {
      ...state.settings,
      ...settings
    };

    if (settings.url && settings.url !== state.url) {
      sendMainMessage('set-server-url', settings.url);
    }

    if (socket) {
      socket.emit('set user', state.settings);
    }
  },
  addMessage(messageData) {
    const isLocal = !messageData.user;
    const decryptedMessage = state.encryptor.decrypt(
      isLocal ? messageData : messageData.message
    );

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);
      let newMessage: {} = {
        message: {
          ...data
        }
      };

      // is local sender
      if (isLocal) {
        newMessage = {
          id: state.instanceId,
          user: {
            color: state.settings.color,
            name: state.settings.name
          },
          message: {
            ...data
          }
        };

        sendMainMessage('add-message-to-history', newMessage);
      } else {
        newMessage = {
          id: messageData.id,
          user: messageData.user,
          message: {
            ...data
          }
        };

        sendMainMessage(
          'notification',
          messageData.user && messageData.user.name
            ? `New chat message from ${messageData.user.name}`
            : `New chat message`
        );
      }

      state.messages.push(newMessage);

      setTimeout(state.scrollToBottom, 0);
    } catch (e) {
      console.log(e);
    }
  }
});

export { state, view };
