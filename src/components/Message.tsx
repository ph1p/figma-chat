import Linkify from 'linkifyjs/react';
import { toJS } from 'mobx';
import React, { FunctionComponent } from 'react';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import nowStrings from 'react-timeago/lib/language-strings/en-short';
import styled, { css } from 'styled-components';
import HashIcon from '../assets/icons/Hash';
import { colors } from '../shared/constants';
import { sendMainMessage } from '../shared/utils';

const formatter = buildFormatter(nowStrings);

function isOnlyEmoji(str: string) {
  return (
    str.replace(
      /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
      ''
    ) === ''
  );
}

interface Props {
  data: any;
  instanceId: any;
}

const Message: FunctionComponent<Props> = ({ data, instanceId }) => {
  const username = data.user.name || '';
  const avatar = data.user.avatar || '';
  const colorClass = colors[data.user.color] || 'blue';
  const selection = data?.message?.selection;
  const isSelf = data.id === instanceId;
  const pageName = selection?.page?.name || '';

  const selectionCount = selection?.length || selection?.nodes?.length || 0;

  const text = data.message.text;
  const isSingleEmoji = !selectionCount && isOnlyEmoji(text);

  return (
    <MessageFlex isSelf={isSelf}>
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
            <span
              onClick={() => {
                const messageSelection = toJS(selection);
                let selectionData = null;

                // fallback without page
                if (messageSelection.length) {
                  selectionData = {
                    ids: messageSelection,
                  };
                } else {
                  selectionData = {
                    ...messageSelection,
                  };
                }

                sendMainMessage('focus-nodes', selectionData);
              }}
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
          {data.message.date && (
            <TimeAgo date={data.message.date} formatter={formatter} />
          )}
        </MessageDate>
      </MessageWrapper>
    </MessageFlex>
  );
};

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

const MessageFlex = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: ${({ isSelf }) => (isSelf ? 'row' : 'row-reverse')};
`;

const MessageWrapper = styled.div`
  margin: 0 0 10px 0;
  text-align: ${({ isSelf }) => (isSelf ? 'right' : 'left')};
  ${MessageDate} {
    text-align: ${({ isSelf }) => (isSelf ? 'right' : 'left')};
  }
`;

const SelectionButton = styled.button`
  cursor: pointer;
  width: 100%;
  font-size: 11px;
  background-color: transparent;
  border-color: ${(p) =>
    p.isSelf ? p.theme.fontColor : 'rgba(255, 255, 255, 0.4)'};
  color: ${(p) => (p.isSelf ? p.theme.fontColor : '#fff')};
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
  font-family: Inter;
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

  .linkified {
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

    .linkified {
      color: #000;
    }

    &.emoji {
      text-align: right;
    }
  }

  div + ${SelectionButton} {
    margin-top: 8px;
  }

  ${Object.keys(colors).map(
    (color) => css`
      &.${colors[color]} {
        color: #fff;
        background-color: ${color};
        header {
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
