import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent } from 'react';
import styled from 'styled-components';

import { Messages } from '@fc/shared/components/Messages';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { MAX_MESSAGES } from '@fc/shared/utils/constants';

import EventEmitter from '../../shared/EventEmitter';
import { useStore } from '../../store';

import Chatbar from './components/Chatbar';
import TodoList from './components/TodoList';

const Chat: FunctionComponent = observer(() => {
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

    EventEmitter.on('relaunch-message', (data) => {
      chatState.selectionIsChecked = true;

      store.setSelection(data.selection || {});

      if (store.selectionCount) {
        sendMessage();
        EventEmitter.emit('notify', 'Selection sent successfully');
      }
    });

    return () => {
      EventEmitter.remove('selection');
      EventEmitter.remove('root-data');
      EventEmitter.remove('relaunch-message');
    };
  }, []);

  useEffect(() => store.scrollToBottom(), [store.messages]);

  if (!store.settings.name) {
    return <TodoList />;
  }

  const onClickSelection = (selection) => {
    let selectionData = null;

    // fallback without page
    if (selection.length) {
      selectionData = {
        ids: selection,
      };
    } else {
      selectionData = {
        ...selection,
      };
    }

    EventEmitter.emit('focus-nodes', selectionData);
  };

  return (
    <Wrapper hasSelection={store.selectionCount > 0}>
      <Messages
        chatState={chatState}
        store={store}
        onClickSelection={onClickSelection}
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
    </Wrapper>
  );
});

const Wrapper = styled.div<{ hasSelection: boolean }>`
  display: grid;
  grid-template-rows: 397px 55px;
`;

export default Chat;
