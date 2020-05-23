import { toJS } from 'mobx';
import React, { FunctionComponent } from 'react';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import nowStrings from 'react-timeago/lib/language-strings/en';
import styled from 'styled-components';
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
                <div>{data.message.text}</div>
              )}
              <button className="selection button button--secondary">
                {pageName ? pageName + ' - ' : ''}
                focus {selectionCount} element
                {selectionCount > 1 ? 's' : ''}
              </button>
            </span>
          ) : (
            <span>{data.message.text}</span>
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
  color: #b3b3b3;
  font-size: 9px;
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
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  padding: 11px 16px 11px;
  word-break: break-word;
  margin-bottom: 4px;

  &.me {
    color: #000;
    padding: 11px 16px;
    background-color: #ebebeb;
    border-radius: 14px 14px 3px 14px;
    header {
      color: #000;
    }

    .selection {
      border-color: #000;
      color: #000;
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
    border-color: #fff;
    color: #fff;
    &:active {
      border: 1px solid;
      box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
    }
  }

  &.lightblue header {
    color: #1c4856;
  }
  &.lightblue .selection {
    border-color: #1c4856;
    color: #1c4856;
  }

  &.lightgreen header {
    color: #3a8459;
  }
  &.lightgreen .selection {
    border-color: #3a8459;
    color: #3a8459;
  }

  &.purple header {
    color: #ffffff;
  }
  &.purple .selection {
    border-color: #ffffff;
    color: #ffffff;
  }

  &.red header {
    color: #ffffff;
  }
  &.red .selection {
    border-color: #ffffff;
    color: #ffffff;
  }

  &.green header {
    color: #0d6540;
  }
  &.green .selection {
    border-color: #0d6540;
    color: #0d6540;
  }

  &.orange header {
    color: #865427;
  }
  &.orange .selection {
    border-color: #865427;
    color: #865427;
  }

  &.beige header {
    color: #564432;
  }
  &.beige .selection {
    border-color: #564432;
    color: #564432;
  }

  &.gray {
    background-color: #4f4f4f;
  }
  &.blue {
    background-color: #18a0fb;
  }
  &.lightblue {
    background-color: #56ccf2;
    color: #1c4856;
  }
  &.purple {
    background-color: #5751ff;
    color: #ffffff;
  }
  &.green {
    background-color: #1bc47d;
    color: #0d6540;
  }
  &.lightgreen {
    background-color: #6fcf97;
    color: #3a8459;
  }
  &.red {
    background-color: #f24822;
    color: #ffffff;
  }
  &.orange {
    background-color: #f2994a;
    color: #865427;
  }
  &.beige {
    background-color: #e7b889;
    color: #564432;
  }
  &.pink {
    background-color: #f47e9a;
    color: #ffffff;
  }
`;

export default Message;
