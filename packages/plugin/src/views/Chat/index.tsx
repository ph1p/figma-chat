import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect, FunctionComponent } from 'react';
import styled from 'styled-components';

import { Messages } from '@fc/shared/components/Messages';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { MAX_MESSAGES } from '@fc/shared/utils/constants';

import EventEmitter from '../../shared/EventEmitter';
import { useStore } from '../../store';

import Chatbar from './components/Chatbar';

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
      let message = {
        text: chatState.textMessage,
      };

      if (store.selectionCount > 0 && chatState.selectionIsChecked) {
        message = {
          ...message,
          ...{
            selection: toJS(store.selection),
          },
        };
      }

      if (!chatState.textMessage && !chatState.selectionIsChecked) {
        store.addNotification(
          'Please enter a text or select something',
          'error'
        );
      } else {
        store.addMessage(
          {
            message,
          },
          socket
        );

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

  useEffect(() => {
    store.scrollToBottom();
  }, [store.messages]);

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

  const removeMessage = (messageId) => {
    if (socket && messageId) {
      store.removeMessage(messageId);
      socket.emit('remove message', {
        roomName: store.roomName,
        messageId,
      });
    }
  };

  return (
    <Wrapper hasSelection={store.selectionCount > 0}>
      <Messages
        removeMessage={removeMessage}
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
  grid-template-rows: 445px 35px;
`;

export default Chat;
