import { observer } from 'mobx-react';
import React, { useState, FunctionComponent } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import Message from '../../../components/Message';

import { MAX_MESSAGES } from '../../../shared/constants';
import { useStore } from '../../../store';

interface Props {
  isBottom: boolean;
  onWheel: () => void;
  chatState: any;
}

const ChatView: FunctionComponent<Props> = (props) => {
  const store = useStore();
  const [containerIsHidden, setContainerIsHidden] = useState(false);

  const showMessageSeperator = (messageIndex = 0) => {
    return (
      (messageIndex + 1) % MAX_MESSAGES === 0 &&
      messageIndex + 1 !== props.chatState.filteredMessages.length
    );
  };

  return (
    <Messages
      onAnimationEnd={() => setContainerIsHidden(!containerIsHidden)}
      ref={store.messagesRef}
      isBottom={props.isBottom}
      onWheel={props.onWheel}
    >
      <TransitionGroup>
        {props.chatState.filteredMessages.map((m, i) => (
          <CSSTransition
            key={m.message.date}
            timeout={400}
            classNames={`message-${
              m.id === store.instanceId ? 'self' : 'other'
            }`}
          >
            <>
              <Message data={m} instanceId={store.instanceId} />
              {showMessageSeperator(i) ? (
                <MessageSeperator>
                  <span>older messages</span>
                </MessageSeperator>
              ) : (
                ''
              )}
            </>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </Messages>
  );
};

const MessageSeperator = styled.div`
  border-width: 1px 0 0 0;
  border-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-style: solid;
  margin: 5px 0 17px;
  text-align: center;
  position: relative;
  span {
    position: absolute;
    top: -8px;
    left: 50%;
    color: ${(p) => p.theme.secondaryBackgroundColor};
    background-color: ${(p) => p.theme.backgroundColor};
    padding: 0 14px;
    transform: translateX(-50%);
    font-size: 10px;
    text-transform: uppercase;
  }
`;

const Messages = styled.div`
  padding: 14px 14px 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  &::after {
    content: '';
    transition: opacity 0.3s;
    opacity: ${(p) => (p.isBottom ? 1 : 0)};
    position: fixed;
    bottom: 41px;
    left: 14px;
    right: 14px;
    background: transparent;
    height: 14px;
    pointer-events: none;
    box-shadow: 0 3px 10px 14px ${(p) => p.theme.backgroundColor};
    border-radius: 40px;
  }
  > div {
    align-self: end;
    > div {
      width: 100%;
      &:last-child {
        .message {
          margin-bottom: 14px;
        }
      }
    }
  }
  .message {
    &-self {
      &-enter {
        opacity: 0;
        transform: translateX(60px);
      }
      &-enter-active {
        opacity: 1;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(0px);
      }
      &-exit {
        opacity: 1;
        transform: translateX(0px);
      }
      &-exit-active {
        opacity: 0;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(60px);
      }
    }
    &-other {
      &-enter {
        opacity: 0;
        transform: translateX(-60px);
      }
      &-enter-active {
        opacity: 1;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(0px);
      }
      &-exit {
        opacity: 1;
        transform: translateX(0px);
      }
      &-exit-active {
        opacity: 0;
        transition: opacity 200ms ease-in, transform 200ms ease-in;
        transform: translateX(-60px);
      }
    }
  }
`;

export default observer(ChatView);
