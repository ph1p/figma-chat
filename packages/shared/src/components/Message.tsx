import Linkify from 'linkifyjs/react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import TimeAgo from 'react-timeago';
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
// @ts-ignore
import nowStrings from 'react-timeago/lib/language-strings/en-short';
import styled, { css } from 'styled-components';

import HashIcon from '@shared/assets/icons/HashIcon';
import { EColors } from '@shared/utils/constants';
import { isOnlyEmoji } from '@shared/utils/helpers';
import { MessageData } from '@shared/utils/interfaces';

const formatter = buildFormatter(nowStrings);

interface Props {
  data: MessageData;
  instanceId: string;
  onClickSelection?: (selection: any) => void;
}

const Message: FunctionComponent<Props> = observer(
  ({ data, instanceId, onClickSelection }) => {
    const username = data.user.name || '';
    const avatar = data.user.avatar || '';
    const colorClass = EColors[data.user.color] || 'blue';
    const selection = toJS(data?.message?.selection);
    const isLocalMessage = data.id === instanceId;
    const pageName = selection?.page?.name || '';

    const selectionCount = (selection?.nodes && selection?.nodes?.length) || 0;

    const text = data?.message?.text || '';
    const date = data?.message?.date || null;
    const isSingleEmoji = !selectionCount && isOnlyEmoji(text);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const styles = useSpring({
      opacity: mounted ? 1 : 0,
    });

    return (
      <animated.div style={styles}>
        <MessageFlex isLocalMessage={isLocalMessage}>
          <div className="message">
            <MessageContainer
              className={`${isLocalMessage ? 'me' : colorClass} ${
                isSingleEmoji && 'emoji'
              }`}
            >
              {!isLocalMessage && username && (
                <MessageHeader>
                  <div className="user">
                    {avatar && avatar + ' '}
                    {username}
                  </div>
                </MessageHeader>
              )}
              {selection ? (
                <span
                  onClick={() =>
                    onClickSelection ? onClickSelection(toJS(selection)) : null
                  }
                >
                  {text && (
                    <Linkify
                      tagName="div"
                      options={{
                        defaultProtocol: 'https',
                      }}
                    >
                      {text}
                    </Linkify>
                  )}
                  <SelectionButton isLocalMessage={isLocalMessage}>
                    <HashIcon />
                    {pageName ? pageName + ' - ' : ''}
                    focus {selectionCount} element
                    {selectionCount > 1 ? 's' : ''}
                  </SelectionButton>
                </span>
              ) : (
                <Linkify
                  tagName="div"
                  options={{
                    defaultProtocol: 'https',
                  }}
                >
                  {text}
                </Linkify>
              )}
            </MessageContainer>
            <MessageDate>
              {date && <TimeAgo date={date} formatter={formatter} />}
            </MessageDate>
          </div>
        </MessageFlex>
      </animated.div>
    );
  }
);

const MessageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #fff;
  .user {
    line-height: 11px;
    opacity: 0.6;
  }
`;

const MessageDate = styled.div`
  font-weight: normal;
  color: ${(p) => p.theme.secondaryFontColor};
  font-size: 9px;
  font-weight: 600;
`;

const MessageFlex = styled.div<{ isLocalMessage: boolean }>`
  display: flex;
  justify-content: flex-end;
  flex-direction: ${({ isLocalMessage }) =>
    isLocalMessage ? 'row' : 'row-reverse'};
  .message {
    margin: 0 0 10px 0;
    text-align: ${({ isLocalMessage }) => (isLocalMessage ? 'right' : 'left')};
    ${MessageDate} {
      text-align: ${({ isLocalMessage }) =>
        isLocalMessage ? 'right' : 'left'};
    }
  }
`;

const SelectionButton = styled('button')<{ isLocalMessage: boolean }>`
  cursor: pointer;
  width: 100%;
  font-size: 11px;
  background-color: transparent;
  border-color: ${(p) =>
    p.isLocalMessage ? p.theme.fontColor : 'rgba(255, 255, 255, 0.4)'};
  color: ${(p) => (p.isLocalMessage ? p.theme.fontColor : '#fff')};
  border-style: solid;
  border-radius: 9px;
  padding: 5px 10px;
  display: flex;
  font-weight: 500;
  line-height: 11px;
  svg {
    margin-right: 5px;
    path {
      fill: ${(p) => (p.isLocalMessage ? p.theme.fontColor : '#fff')};
    }
  }
  &:hover {
    border-color: transparent;
    background-color: rgba(0, 0, 0, ${(p) => (p.isLocalMessage ? 0.1 : 0.2)});
  }
  &:active,
  &:focus {
    border-color: transparent;
    outline: none;
    background-color: rgba(0, 0, 0, ${(p) => (p.isLocalMessage ? 0.2 : 0.3)});
  }
`;

const MessageContainer = styled.div`
  background-color: #18a0fb;
  border-radius: 4px 14px 14px 14px;
  color: #fff;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  padding: 10px;
  word-break: break-word;
  margin-bottom: 4px;
  max-width: 240px;
  text-align: left;
  header {
    margin-bottom: 4px;
  }

  .linkified,
  a {
    color: #fff;
    font-weight: 600;
  }

  &.me {
    color: ${(p) => p.theme.fontColor};
    background-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-radius: 14px 14px 4px 14px;
    header {
      color: #000;
    }

    .linkified,
    a {
      color: #000;
      color: ${(p) => p.theme.fontColor};
    }

    &.emoji {
      text-align: right;
    }
  }

  div + button {
    margin-top: 8px;
  }

  ${Object.keys(EColors).map(
    (color) => css`
      &.${String(EColors[color as keyof typeof EColors])} {
        color: #fff;
        background-color: ${color};
        header,
        a {
          color: #fff;
        }
        .selection {
          border-color: #fff;
          color: #fff;
        }
      }
    `
  )}

  &.emoji {
    padding: 11px 0;
    background-color: transparent;
    font-size: 30px;
    text-align: left;
    header {
      margin-bottom: 10px;
      color: ${(p) => p.theme.fontColor};
    }
  }
`;

export default Message;
