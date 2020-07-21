import { toJS } from 'mobx';

import { observer, useLocalStore } from 'mobx-react';
import React, { useEffect, FunctionComponent } from 'react';
import styled from 'styled-components';
import { withSocketContext } from '../../shared/SocketProvider';
import Chatbar from './components/Chatbar';

import { IS_PROD, MAX_MESSAGES } from '../../shared/constants';
import { sendMainMessage } from '../../shared/utils';
import { useStore } from '../../store';
import Messages from './components/Messages';

interface ChatProps {
  socket: SocketIOClient.Socket;
}

const ChatView: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();

  const chatState = useLocalStore(() => ({
    textMessage: '',
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    get hideMoreButton() {
      return (
        chatState.messagesToShow >= store.messages.length ||
        chatState.filteredMessages.length >= store.messages.length
      );
    },
    get filteredMessages() {
      return [...store.messages].slice(-chatState.messagesToShow);
    },
  }));

  const sendMessage = (e = null) => {
    if (e) {
      e.preventDefault();
    }
    if (store.roomName) {
      let data = {
        text: chatState.textMessage,
        date: new Date(),
      };

      if (store.selectionCount > 0 && chatState.selectionIsChecked) {
        data = {
          ...data,
          ...{
            selection: store.selection,
          },
        };
      }

      if (!chatState.textMessage && !chatState.selectionIsChecked) {
        store.addNotification(
          'Please enter a text or select something',
          'error'
        );
      } else {
        const message = store.encryptor.encrypt(JSON.stringify(data));

        props.socket.emit('chat message', {
          roomName: store.roomName,
          message,
        });

        store.addMessage(message);

        chatState.textMessage = '';
        chatState.selectionIsChecked = false;
      }
    }
  };

  // All messages from main
  onmessage = (message) => {
    const pmessage = message.data.pluginMessage;

    if (pmessage) {
      // set selection
      if (pmessage.type === 'selection') {
        const hasSelection =
          pmessage.payload?.length > 0 || pmessage.payload?.nodes?.length > 0;

        store.selection = hasSelection ? pmessage.payload : {};

        if (!hasSelection) {
          chatState.selectionIsChecked = false;
        }
      }

      if (pmessage.type === 'root-data') {
        const {
          roomName: dataRoomName = '',
          secret: dataSecret = '',
          history: messages = [],
          selection = {
            page: '',
            nodes: [],
          },
          settings = {},
          instanceId = '',
        } = {
          ...pmessage.payload,
          ...(!IS_PROD
            ? {
                secret: 'thisismysecretkey',
                roomName: 'dev',
              }
            : {}),
        };

        store.secret = dataSecret;
        store.roomName = dataRoomName;
        store.messages = messages;
        store.instanceId = instanceId;
        store.selection = selection;

        store.persistSettings(settings, props.socket, true);
      }

      if (pmessage.type === 'relaunch-message') {
        chatState.selectionIsChecked = true;

        store.selection = pmessage.payload.selection || {};

        if (store.selectionCount) {
          sendMessage();
          sendMainMessage('notify', 'Selection sent successfully');
        }
      }
    }
  };

  useEffect(() => store.scrollToBottom(), [store.messages]);

  const showMore = () => {
    if (
      chatState.filteredMessages.length + MAX_MESSAGES >=
      store.messages.length
    ) {
      chatState.messagesToShow = store.messages.length;
    } else {
      chatState.messagesToShow += MAX_MESSAGES;
    }
  };

  return (
    <Chat hasSelection={store.selectionCount > 0}>
      <Messages
        chatState={chatState}
        isBottom={store.disableAutoScroll}
        onWheel={() => {
          const { current } = toJS(store.messagesRef);
          if (current.scrollTop <= current.scrollHeight * 0.2) {
            showMore();
          }
          store.disableAutoScroll =
            current.scrollHeight - (current.scrollTop + current.clientHeight) >
            0;
        }}
      />

      <Chatbar
        sendMessage={sendMessage}
        setTextMessage={(text) => (chatState.textMessage = text)}
        textMessage={chatState.textMessage}
        setSelectionIsChecked={(isChecked) =>
          (chatState.selectionIsChecked = isChecked)
        }
        selectionIsChecked={chatState.selectionIsChecked}
      />
    </Chat>
  );
};

const Chat = styled.div`
  display: grid;
  grid-template-rows: 397px 55px;
`;

export default withSocketContext(observer(ChatView));
