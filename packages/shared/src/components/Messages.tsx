import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect } from 'react';
import styled, { css } from 'styled-components';

import Message from '../components/Message';
import { MAX_MESSAGES } from '../utils/constants';
import { MessageData } from '../utils/interfaces';

interface Props {
  chatState: any;
  onClickSelection?: (selection: any) => void;
  isWeb?: boolean;
  store: any;
}

export const Messages: FunctionComponent<Props> = observer((props) => {
  const showMessageSeperator = (messageIndex = 0) => {
    return (
      (messageIndex + 1) % MAX_MESSAGES === 0 &&
      messageIndex + 1 !== props.chatState.filteredMessages.length
    );
  };

  useEffect(() => {
    if (props.store.messagesRef.current) {
      const onWheel = () => {
        let isLoadingMore = false;
        const { current } = toJS(props.store.messagesRef);
        let prevScroll = 0;

        if (
          current &&
          current.scrollTop < 40 &&
          !isLoadingMore &&
          props.chatState.filteredMessages.length !==
            props.store.messages.length
        ) {
          prevScroll = current.scrollHeight;
          isLoadingMore = true;

          if (
            props.chatState.filteredMessages.length + MAX_MESSAGES >=
            props.store.messages.length
          ) {
            props.chatState.setMessagesToShow(props.store.messages.length);
          } else {
            props.chatState.setMessagesToShow(
              props.chatState.messagesToShow + MAX_MESSAGES
            );
          }

          current.scrollTop = current.scrollHeight - prevScroll;
          isLoadingMore = false;
        }

        if (current) {
          props.store.disableAutoScroll(
            current.scrollHeight - (current.scrollTop + current.clientHeight) >
              0
          );
        }
      };

      props.store.messagesRef.current.addEventListener('wheel', onWheel);
    }
  }, [props.store.messagesRef]);

  return (
    <Wrapper ref={props.store.messagesRef} isWeb={props.isWeb}>
      <ScrollWrapper>
        {props.chatState.filteredMessages.map(
          (data: MessageData, i: number) => (
            <React.Fragment key={data.message?.date}>
              {showMessageSeperator(i) && (
                <MessageSeperator>
                  <span>older messages</span>
                </MessageSeperator>
              )}
              <Message
                data={data}
                instanceId={props.store.instanceId}
                onClickSelection={props.onClickSelection}
              />
            </React.Fragment>
          )
        )}
      </ScrollWrapper>
    </Wrapper>
  );
});

const Wrapper = styled.div<{ isWeb?: boolean }>`
  position: relative;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  ${(p) =>
    p.isWeb
      ? css`
          height: calc(500px - 56px);
          max-height: 100%;
          @media (min-width: 450px) {
            height: calc(500px - 56px);
          }
          @media (max-width: 450px) {
            height: calc(100vh - 106px);
            width: 100%;
            width: 100%;
          }
        `
      : ''}
`;

const ScrollWrapper = styled.div`
  padding: 9px 9px 0;
  width: 100%;
  align-self: end;
  &::after {
    content: '';
    transition: opacity 0.3s;
    opacity: 1;
    position: fixed;
    bottom: 30px;
    left: 14px;
    right: 14px;
    background: transparent;
    height: 14px;
    pointer-events: none;
    box-shadow: 0 3px 10px 14px ${(p) => p.theme.backgroundColor};
    border-radius: 0;
  }
`;

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
