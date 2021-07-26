import { useStore } from '@web/store/RootStore';
import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import styled from 'styled-components';

import { MAX_MESSAGES } from '@shared/utils/constants';

import { ChatBar } from './components/ChatBar';
import ChatView from './components/ChatView';

export const Chat = observer(() => {
  const store = useStore();

  const chatState = useLocalObservable(() => ({
    selectionIsChecked: false,
    messagesToShow: MAX_MESSAGES,
    setMessagesToShow(num: number) {
      this.messagesToShow = num;
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

  return (
    <Wrapper>
      <ChatView
        chatState={chatState}
        isBottom={store.autoScrollDisabled}
        onWheel={() => {
          const { current } = toJS(store.messagesRef);
          if (current) {
            if (current.scrollTop <= current.scrollHeight * 0.2) {
              showMore();
            }
            store.disableAutoScroll(
              current.scrollHeight -
                (current.scrollTop + current.clientHeight) >
                0
            );
          }
        }}
      />
      <ChatBar />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr 60px;
  height: 100%;
`;
