import { observer, useLocalObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { Messages } from '@fc/shared/components/Messages';
import { MAX_MESSAGES } from '@fc/shared/utils/constants';

import { useStore } from '../../store/RootStore';

import { ChatBar } from './components/ChatBar';

export const Chat = observer(() => {
  const store = useStore();

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
      <Messages chatState={chatState} isWeb store={store} />
      <ChatBar />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr 54px;
  height: 100%;
`;