import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import Linkify from 'linkify-react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { rgba } from 'polished';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import TimeAgo from 'react-timeago';
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
// @ts-ignore
import nowStrings from 'react-timeago/lib/language-strings/en-short';
import styled, { css } from 'styled-components';

import HashIcon from '../assets/icons/HashIcon';
import { EColors } from '../utils/constants';
import { isOnlyEmoji } from '../utils/helpers';
import { MessageData } from '../utils/interfaces';

const formatter = buildFormatter(nowStrings);

const gf = new GiphyFetch('omj1iPoq5H5GTi2Xjz2E9NFCcVqGLuPZ');

interface Props {
  data: MessageData;
  removeMessage: (messageId: string) => void;
  onClickSelection?: (selection: any) => void;
  store: any;
}

const Message: FunctionComponent<Props> = observer(
  ({ data, onClickSelection, store, removeMessage }) => {
    const messageId = data.id || null;
    const username = data.user.name || '';
    const avatar = data.user.avatar || '';
    const photoUrl = data.user.photoUrl || '';
    const colorClass = EColors[data.user.color] || 'blue';
    const selection = toJS(data?.message?.selection);
    const isLocalMessage = data.user.id === store.currentUser.id;
    const pageName = selection?.page?.name || '';

    const selectionCount = (selection?.nodes && selection?.nodes?.length) || 0;

    const giphy = data?.message?.giphy || null;
    const text = data?.message?.text || '';
    const date = data?.message?.date || null;
    const external = data?.message?.external || false;
    const isSingleEmoji = !selectionCount && isOnlyEmoji(text);
    const [mounted, setMounted] = useState(false);
    const [giphyImage, setGiphyImage] = useState<any>(null);

    useEffect(() => {
      if (giphy) {
        gf.gif(giphy).then((gif) => {
          setGiphyImage(gif.data);
          if (store.scrollToBottom) {
            store.scrollToBottom();
          }
        });
      }
    }, [giphy]);

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
              isGiphy={Boolean(giphy)}
              className={`${isLocalMessage ? 'me' : colorClass} ${
                isSingleEmoji && 'emoji'
              }`}
            >
              {!isLocalMessage && username && (
                <MessageHeader>
                  <div className="user">
                    {avatar ? (
                      avatar + ' '
                    ) : photoUrl && !external ? (
                      <img src={photoUrl} />
                    ) : (
                      ''
                    )}
                    {username}
                  </div>
                </MessageHeader>
              )}

              {giphy ? (
                giphyImage ? (
                  <Gif noLink gif={giphyImage} width={220} />
                ) : (
                  <LoadingGif>loading...</LoadingGif>
                )
              ) : selection ? (
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
                        target: '_blank',
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
                    target: '_blank',
                  }}
                >
                  {text}
                </Linkify>
              )}
            </MessageContainer>
            <MessageOptions isLocalMessage={isLocalMessage}>
              {isLocalMessage && messageId ? (
                <MessageTrash onClick={() => removeMessage(messageId)}>
                  delete
                </MessageTrash>
              ) : null}
              <MessageDate className={`${isLocalMessage ? 'me' : colorClass}`}>
                {date && <TimeAgo date={date} formatter={formatter} />}
              </MessageDate>
            </MessageOptions>
          </div>
        </MessageFlex>
      </animated.div>
    );
  }
);

const LoadingGif = styled.div`
  padding: 10px;
`;

const MessageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #fff;
  .user {
    line-height: 11px;
    opacity: 1;
    img {
      border-radius: 100%;
      width: 10px;
      display: inline-block;
      margin-right: 4px;
    }
  }
`;

const MessageDate = styled.div`
  font-weight: normal;
  color: ${(p) => p.theme.secondaryFontColor};
  font-size: 11px;
  font-weight: 600;
`;

const MessageOptions = styled.div<{ isLocalMessage: boolean }>`
  display: flex;
  flex-direction: row;
  opacity: 0;
  transition: all 0.3s;
  transform: translateX(${({ isLocalMessage }) => (isLocalMessage ? 6 : -6)}px);
  padding: 1px;
  /* margin: ${({ isLocalMessage }) =>
    isLocalMessage ? '0 6px 0 0' : '0 0 0 6px'}; */
  align-items: start;
  /* align-items: ${({ isLocalMessage }) =>
    isLocalMessage ? 'end' : 'start'}; */
  ${MessageDate} {
    font-size: 9px;
    color: #fff;
    background-color: ${(p) => p.theme.secondaryFontColor};
    padding: 2px 7px;
    border-radius: 22px;
    text-align: ${({ isLocalMessage }) => (isLocalMessage ? 'right' : 'left')};
    margin: ${({ isLocalMessage }) =>
      isLocalMessage ? '0 6px 0 0' : '0 0 0 6px'};
    ${Object.keys(EColors).map(
      (color) => css`
        &.${String(EColors[color as keyof typeof EColors])} {
          color: #fff;
          background-color: ${rgba(color, 0.4)};
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
  }
`;

const MessageTrash = styled.div`
  /* width: 24px;
  height: 24px; */
  border-radius: 22px;
  color: #fff;
  font-size: 9px;
  background-color: #fd5959;
  padding: 2px 7px;
  margin-right: 6px;
  cursor: pointer;
  svg {
    transform: scale(0.8);
    path {
      fill: #fff;
      stroke: #fff;
      &:last-child {
        stroke: #fd5959;
      }
    }
  }
`;

const MessageFlex = styled.div<{ isLocalMessage: boolean }>`
  display: flex;
  justify-content: flex-end;
  flex-direction: ${({ isLocalMessage }) =>
    isLocalMessage ? 'row' : 'row-reverse'};
  &:hover {
    .message {
      ${MessageOptions} {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
  .message {
    margin: 0 0 10px 0;
    text-align: ${({ isLocalMessage }) => (isLocalMessage ? 'right' : 'left')};
    display: flex;
    flex-direction: ${({ isLocalMessage }) =>
      isLocalMessage ? 'row-reverse' : 'row'};
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

const MessageContainer = styled.div<{ isGiphy: boolean }>`
  position: relative;
  background-color: #18a0fb;
  border-radius: 4px 14px 14px 14px;
  color: #fff;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  word-break: break-word;
  margin-bottom: 4px;
  max-width: 240px;
  text-align: left;
  overflow: ${(p) => (p.isGiphy ? 'hidden' : 'initial')};
  padding: ${(p) => (p.isGiphy ? 0 : '6px 10px')};
  ${(p) =>
    p.isGiphy
      ? css`
          ${MessageHeader} {
            position: absolute;
            left: 10px;
            top: 10px;
            z-index: 10;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 4px 6px;
            color: #fff;
          }
        `
      : ''}

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
