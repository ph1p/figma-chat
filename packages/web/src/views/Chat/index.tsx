import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { Messages } from '@fc/shared/components/Messages';
import { useSocket } from '@fc/shared/utils/SocketProvider';
import { MAX_MESSAGES } from '@fc/shared/utils/constants';

import { useStore } from '../../store/RootStore';

import { ChatBar } from './components/ChatBar';

export const Chat = observer(() => {
  const store = useStore();
  const socket = useSocket();

  const chatState = useLocalObservable(() => ({
    textMessage: '',
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    setMessagesToShow(num: number) {
      this.messagesToShow = num;
    },
    get filteredMessages() {
      return [...store.messages].slice(-chatState.messagesToShow);
    },
  }));

  useEffect(() => store.scrollToBottom(), [store.messages]);

  return (
    <Wrapper>
      <Messages
        removeMessage={(messageId) => {
          if (socket && messageId) {
            store.removeMessage(messageId);
            socket.emit('remove message', {
              roomName: store.room,
              messageId,
            });
          }
        }}
        chatState={chatState}
        isWeb
        store={store}
      />
      <ChatBar />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr 46px;
  height: 100%;
`;
