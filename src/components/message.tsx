import React, { FunctionComponent } from 'react';
import { sendMainMessage, colors } from '../utils';
import styled from 'styled-components';

interface Props {
  data: any;
  instanceId: any;
}

const Message: FunctionComponent<Props> = ({ data, instanceId }) => {
  const username = data.user.name || '';
  const colorClass = colors[data.user.color] || 'blue';

  return (
    <MessageContainer
      className={`message ${data.id === instanceId ? 'me' : colorClass}`}
    >
      {data.id !== instanceId ? <div className="user">{username}</div> : ''}
      {data.message.selection ? (
        <span
          onClick={() =>
            sendMainMessage('focus-nodes', {
              ids: data.message.selection
            })
          }
        >
          {data.message.text}
          <button className="selection button button--secondary">
            attached elements
          </button>
        </span>
      ) : (
        <span>{data.message.text}</span>
      )}
    </MessageContainer>
  );
};

const MessageContainer = styled.div`
  background-color: #18a0fb;
  border-radius: 15px;
  color: #fff;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  padding: 12px 15px;
  margin: 0 30% 15px 0;
  word-break: break-word;

  &.me {
    color: #000;
    margin: 0 0 15px 30%;
    background-color: #ebebeb;
  }

  .user {
    font-size: 9px;
    margin-bottom: 5px;
    color: #fff;
  }

  .selection {
    margin: 8px 0 0 0;
    cursor: pointer;
    width: 100%;
    background-color: transparent;
    border-color: #fff;
    color: #fff;
  }

  &.me .user {
    color: #000;
  }

  &.me .selection {
    border-color: #000;
    color: #000;
  }

  &.lightblue .user {
    color: #1c4856;
  }
  &.lightblue .selection {
    border-color: #1c4856;
    color: #1c4856;
  }

  &.lightgreen .user {
    color: #3a8459;
  }
  &.lightgreen .selection {
    border-color: #3a8459;
    color: #3a8459;
  }

  &.purple .user {
    color: #ffffff;
  }
  &.purple .selection {
    border-color: #ffffff;
    color: #ffffff;
  }

  &.red .user {
    color: #ffffff;
  }
  &.red .selection {
    border-color: #ffffff;
    color: #ffffff;
  }

  &.green .user {
    color: #0d6540;
  }
  &.green .selection {
    border-color: #0d6540;
    color: #0d6540;
  }

  &.orange .user {
    color: #865427;
  }
  &.orange .selection {
    border-color: #865427;
    color: #865427;
  }

  &.beige .user {
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
    background-color: #7b61ff;
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
