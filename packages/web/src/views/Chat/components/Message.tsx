import { useStore } from '@web/store/RootStore';
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
}

const Message: FunctionComponent<Props> = observer(({ data }) => {
  const store = useStore();
  const username = data.user.name || '';
  const avatar = data.user.avatar || '';
  const colorClass = EColors[data.user.color] || 'blue';
  const selection = toJS(data?.message?.selection);
  const isSelf = data.id === store.instanceId;
  const pageName = selection?.page?.name || '';

  const selectionCount = (selection?.nodes && selection?.nodes?.length) || 0;

  const text = data?.message?.text || '';
  const date = data?.message?.date || null;
  const isSingleEmoji = !selectionCount && isOnlyEmoji(text);

  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    setToggle(true);
  }, []);

  const styles = useSpring({
    translateX: toggle ? 0 : isSelf ? 60 : -60,
    opacity: toggle ? 1 : 0,
  });

  return (
    <animated.div style={styles}>
      <MessageFlex style={styles} isSelf={isSelf}>
        <MessageWrapper className="message" isSelf={isSelf}>
          <MessageContainer
            className={`${isSelf ? 'me' : colorClass} ${
              isSingleEmoji && 'emoji'
            }`}
          >
            {!isSelf && username && (
              <MessageHeader>
                <div className="user">
                  {avatar && avatar + ' '}
                  {username}
                </div>
              </MessageHeader>
            )}
            {selection ? (
              <span onClick={() => {}}>
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
                <SelectionButton isSelf={isSelf}>
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
        </MessageWrapper>
      </MessageFlex>
    </animated.div>
  );
});

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

const MessageFlex = styled.div<{ isSelf: boolean; style: any }>`
  display: flex;
  justify-content: flex-end;
  flex-direction: ${({ isSelf }) => (isSelf ? 'row' : 'row-reverse')};
`;

const MessageWrapper = styled.div<{ isSelf: boolean }>`
  margin: 0 0 10px 0;
  text-align: ${({ isSelf }) => (isSelf ? 'right' : 'left')};
  ${MessageDate} {
    text-align: ${({ isSelf }) => (isSelf ? 'right' : 'left')};
  }
`;

const SelectionButton = styled('button')<{ isSelf: boolean }>`
  cursor: pointer;
  width: 100%;
  font-size: 11px;
  background-color: transparent;
  border-color: ${(p) =>
    p.isSelf ? p.theme.fontColor : 'rgba(255, 255, 255, 0.4)'};
  color: ${(p) => (p.isSelf ? p.theme.fontColor : '#fff')};
  border-style: solid;
  border-radius: 9px;
  padding: 5px 10px;
  display: flex;
  font-weight: 500;
  line-height: 11px;
  svg {
    margin-right: 5px;
    path {
      fill: ${(p) => (p.isSelf ? p.theme.fontColor : '#fff')};
    }
  }
  &:hover {
    border-color: transparent;
    background-color: rgba(0, 0, 0, ${(p) => (p.isSelf ? 0.1 : 0.2)});
  }
  &:active,
  &:focus {
    border-color: transparent;
    outline: none;
    background-color: rgba(0, 0, 0, ${(p) => (p.isSelf ? 0.2 : 0.3)});
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
  display: inline-block;
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
