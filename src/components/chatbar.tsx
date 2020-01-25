import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { state } from '../shared/state';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
}

const ChatBar: FunctionComponent<ChatProps> = props => {
  const selection = state.selection.length;
  const hasSelection = Boolean(selection);
  const [show, setShow] = useState(hasSelection);
  const chatTextInput = useRef(null);

  useEffect(() => {
    if (hasSelection) {
      setShow(true);
    }
  }, [hasSelection]);

  const onAnimationEnd = () => {
    if (!hasSelection) {
      setShow(false);
    }
  };

  return (
    <form onSubmit={props.sendMessage}>
      {show ? (
        <SelectionInfo
          hasSelection={hasSelection}
          onAnimationEnd={onAnimationEnd}
        >
          <input
            className="checkbox__box"
            type="checkbox"
            checked={props.selectionIsChecked}
            onChange={e => {
              props.setSelectionIsChecked(e.target.checked);
              chatTextInput.current.focus();
            }}
            id="selectionIsChecked"
          />
          <label className="checkbox__label" htmlFor="selectionIsChecked">
            Add current selection (<span>{selection}</span> element
            {selection > 1 ? 's' : ''})
          </label>
        </SelectionInfo>
      ) : (
        ''
      )}
      <ChatInput>
        <input
          ref={chatTextInput}
          type="input"
          className="input"
          value={props.textMessage}
          onChange={({ target }: any) =>
            props.setTextMessage(target.value.substr(0, 1000))
          }
          placeholder={`Write something ... ${
            props.selectionIsChecked ? '(optional)' : ''
          }`}
        />
        <button type="submit">
          <div className="icon icon--comment" />
        </button>
      </ChatInput>
    </form>
  );
};

const SelectionInfo = styled.div`
  animation: ${p => (p.hasSelection ? 'fadeIn' : 'fadeOut')} 0.3s;
  position: ${p => (p.hasSelection ? '' : 'absolute')};
  bottom: ${p => (p.hasSelection ? '' : '45px')};
  width: 100%;
  border-top: 0;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  label,
  input {
    cursor: pointer;
  }
  label {
    padding: 10px 0;
    span {
      font-weight: bold;
      margin-right: 3px;
    }
    &::before {
      border-color: #fff;
    }
  }
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  border-top: 1px solid #e9e9e9;
  background-color: #fff;
  position: relative;
  z-index: 3;
  input {
    margin: 7px 0 0 7px;
  }
  button {
    border: 0;
    padding: 6px 5px;
    margin: 0;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    &:hover {
      .icon {
        background-color: rgba(0, 0, 0, 0.06);
        cursor: pointer;
        border-radius: 5px;
      }
    }
  }
`;

export default ChatBar;
