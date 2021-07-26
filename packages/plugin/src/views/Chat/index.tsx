import EventEmitter from '@plugin/shared/EventEmitter';
import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent } from 'react';
import styled from 'styled-components';

import { useSocket } from '@shared/utils/SocketProvider';
import { MAX_MESSAGES } from '@shared/utils/constants';

import { sendMainMessage } from '../../shared/utils';
import { useStore } from '../../store';

import Chatbar from './components/Chatbar';
import Messages from './components/Messages';
import TodoList from './components/TodoList';

const ChatView: FunctionComponent = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const chatState = useLocalObservable(() => ({
    textMessage: '',
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    setMessagesToShow(num: number) {
      this.messagesToShow = num;
    },
    setTextMessage(msg: string) {
      this.textMessage = msg;
    },
    setSelectionIsChecked(checked: boolean) {
      this.selectionIsChecked = checked;
    },
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

        socket.emit('chat message', {
          roomName: store.roomName,
          message,
        });

        store.addMessage(message);

        chatState.setTextMessage('');
        chatState.setSelectionIsChecked(false);
      }
    }
  };

  useEffect(() => {
    EventEmitter.on('selection', (selection) => {
      const hasSelection =
        selection?.length > 0 || selection?.nodes?.length > 0;

      store.setSelection(hasSelection ? selection : {});

      if (!hasSelection) {
        chatState.selectionIsChecked = false;
      }
    });

    EventEmitter.on('root-data', (data) => {
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
        ...data,
      };

      store.setSecret(dataSecret);
      store.setRoomName(dataRoomName);
      store.setMessages(messages);
      store.setInstanceId(instanceId);
      store.setSelection(selection);

      store.persistSettings(settings, socket, true);
    });

    EventEmitter.on('relaunch-message', (data) => {
      chatState.selectionIsChecked = true;

      store.setSelection(data.selection || {});

      if (store.selectionCount) {
        sendMessage();
        sendMainMessage('notify', 'Selection sent successfully');
      }
    });

    return () => {
      EventEmitter.remove('selection');
      EventEmitter.remove('root-data');
      EventEmitter.remove('relaunch-message');
    };
  }, []);

  useEffect(() => store.scrollToBottom(), [store.messages]);

  const showMore = () => {
    if (
      chatState.filteredMessages.length + MAX_MESSAGES >=
      store.messages.length
    ) {
      chatState.setMessagesToShow(store.messages.length);
    } else {
      chatState.setMessagesToShow(chatState.messagesToShow + MAX_MESSAGES);
    }
  };

  if (!store.settings.name) {
    return <TodoList />;
  }

  return (
    <Chat hasSelection={store.selectionCount > 0}>
      <Messages
        chatState={chatState}
        isBottom={store.autoScrollDisabled}
        onWheel={() => {
          const { current } = toJS(store.messagesRef);
          if (current.scrollTop <= current.scrollHeight * 0.2) {
            showMore();
          }
          store.disableAutoScroll(
            current.scrollHeight - (current.scrollTop + current.clientHeight) >
              0
          );
        }}
      />

      <Chatbar
        sendMessage={sendMessage}
        setTextMessage={(text) => chatState.setTextMessage(text)}
        textMessage={chatState.textMessage}
        setSelectionIsChecked={(isChecked) =>
          (chatState.selectionIsChecked = isChecked)
        }
        selectionIsChecked={chatState.selectionIsChecked}
      />
    </Chat>
  );
});

const Chat = styled.div`
  display: grid;
  grid-template-rows: 397px 55px;
`;

export default ChatView;
