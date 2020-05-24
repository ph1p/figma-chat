import { toJS } from 'mobx';
import React, { FunctionComponent } from 'react';
import Linkify from 'linkifyjs/react';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import nowStrings from 'react-timeago/lib/language-strings/en';
import styled, { css } from 'styled-components';
import { colors } from '../shared/constants';
import { sendMainMessage } from '../shared/utils';

const formatter = buildFormatter(nowStrings);

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

  return (
    <MessageFlex isSelf={isSelf}>
      <MessageWrapper className="message" isSelf={isSelf}>
        <MessageContainer className={`${isSelf ? 'me' : colorClass}`}>
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
              {data.message.text && (
                <Linkify
                  tagName="div"
                  options={{
                    defaultProtocol: 'https',
                  }}
                >
                  {data.message.text}
                </Linkify>
              )}
              <button className="selection button button--secondary">
                {pageName ? pageName + ' - ' : ''}
                focus {selectionCount} element
                {selectionCount > 1 ? 's' : ''}
              </button>
            </span>
          ) : (
            <Linkify
              tagName="span"
              options={{
                defaultProtocol: 'https',
              }}
            >
              {data.message.text}
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
  flex-direction: row;
  justify-content: flex-end;
  flex-direction: ${({ isSelf }) => (isSelf ? 'row' : 'row-reverse')};
`;

const MessageWrapper = styled.div`
  margin: 0 0 10px 0;
  ${MessageDate} {
    text-align: ${({ isSelf }) => (isSelf ? 'right' : 'left')};
  }
`;

const MessageContainer = styled.div`
  background-color: #18a0fb;
  border-radius: 3px 14px 14px 14px;
  color: #fff;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  padding: 11px 16px 11px;
  word-break: break-word;
  margin-bottom: 4px;
  max-width: 240px;
  header {
    margin-bottom: 4px;
  }

  .linkified {
    color: #fff;
    font-weight: 600;
  }

  &.me {
    color: ${(p) => p.theme.fontColor};
    padding: 11px 16px;
    background-color: ${(p) => p.theme.secondaryBackgroundColor};
    border-radius: 14px 14px 3px 14px;
    header {
      color: #000;
    }

    .linkified {
      color: #000;
    }

    .selection {
      border-color: ${(p) => p.theme.fontColor};
      color: ${(p) => p.theme.fontColor};
      opacity: 0.7;
      margin-top: 0;
      &:hover {
        opacity: 1;
      }
    }
  }

  .selection {
    margin: 5px 0 0 0;
    cursor: pointer;
    width: 100%;
    background-color: transparent;
    border-color: ${(p) => p.theme.fontColor};
    color: ${(p) => p.theme.fontColor};
    &:active {
      border: 1px solid;
      box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
    }
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
`;

export default Message;
