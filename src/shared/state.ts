import SimpleEncryptor from 'simple-encryptor';
import { store, view } from 'react-easy-state';
import { DEFAULT_SERVER_URL, sendMainMessage } from '../utils';

const state = store({
  //---
  secret: '',
  roomName: '',
  instanceId: '',
  get encryptor() {
    return SimpleEncryptor(state.secret);
  },
  // ---
  messages: [],
  // ---
  isFocused: true,
  isMinimized: false,
  online: 0,
  settings: {
    name: '',
    color: '',
    url: DEFAULT_SERVER_URL
  },
  //---
  removeAllMessages() {
    if (
      (window as any).confirm('Remove all messages? (This cannot be undone)')
    ) {
      sendMainMessage('remove-all-messages');
      (window as any).alert('Messages successfully removed');
      state.messages = [];
    }
  },
  persistSettings(settings) {
    sendMainMessage('save-user-settings', Object.assign({}, settings));

    state.settings = {
      ...state.settings,
      ...settings
    }

    if (settings.url && settings.url !== state.url) {
      sendMainMessage('set-server-url', settings.url);
    }
  },
  addMessage(messageData) {
    const isLocal = typeof messageData === 'string';

    const decryptedMessage = state.encryptor.decrypt(
      isLocal ? messageData : messageData.message
    );

    // silent on error
    try {
      const data = JSON.parse(decryptedMessage);

      // local sender
      if (isLocal) {
        messageData = {
          id: state.instanceId,
          message: messageData,
          user: {
            color: state.settings.color,
            name: state.settings.name
          }
        };
      }

      const newMessage = {
        id: messageData.id,
        user: messageData.user,
        message: {
          ...data
        }
      };

      if (isLocal) {
        sendMainMessage('add-message-to-history', newMessage);
      } else {
        sendMainMessage(
          'notification',
          messageData.user && messageData.user.name
            ? `New chat message from ${messageData.user.name}`
            : `New chat message`
        );

        figma.notify(`new message from ${data}`);
      }

      state.messages.push(newMessage);
      console.log('hm');
    } catch (e) {
      console.log(e);
    }
  }
});

export { state, view };
