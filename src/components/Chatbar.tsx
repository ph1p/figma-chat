import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { state } from '../shared/state';
import { sendMainMessage } from '../shared/utils';
import { SharedIcon } from '../shared/style';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
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
    <ChatBarForm
      onSubmit={(e) => {
        props.sendMessage(e);
        chatTextInput.current.value = '';
      }}
    >
      {false ? (
        <SelectionInfo
          hasSelection={hasSelection}
          onAnimationEnd={onAnimationEnd}
        >
          <input
            className="checkbox__box"
            type="checkbox"
            checked={props.selectionIsChecked}
            onChange={(e: any) => {
              props.setSelectionIsChecked(e.target.checked);
              chatTextInput.current.focus();
            }}
            id="selectionIsChecked"
          />
          <label className="checkbox__label" htmlFor="selectionIsChecked">
            Add current selection (<span>{selection}</span> element
            {selection > 1 ? 's' : ''})
          </label>

          <PreviewSelection
            onClick={() =>
              sendMainMessage('focus-nodes', {
                ids: [...state.selection],
              })
            }
          >
            <SharedIcon>
              <div className="icon icon--visible icon--white" />
            </SharedIcon>
          </PreviewSelection>
        </SelectionInfo>
      ) : (
        ''
      )}
      <ChatInput hasSelection={hasSelection}>
        <BellIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 15 16"
          >
            <path
              fill="#5751FF"
              fillRule="evenodd"
              d="M11 5v4l1 1H2l1-1V5a4 4 0 018 0zm1 4a2 2 0 002 2H0a2 2 0 002-2V5a5 5 0 0110 0v4zm-5 5l-2-2H4a3 3 0 106 0H9l-2 2z"
              clipRule="evenodd"
            />
          </svg>
        </BellIcon>
        <input
          ref={chatTextInput}
          type="input"
          onChange={({ target }: any) =>
            props.setTextMessage(target.value.substr(0, 1000))
          }
          placeholder={`Write something ... ${
            props.selectionIsChecked ? '(optional)' : ''
          }`}
        />
      </ChatInput>
      <SelectionCheckbox hasSelection={hasSelection}>lol</SelectionCheckbox>
    </ChatBarForm>
  );
};

const ChatBarForm = styled.form`
  position: relative;
  margin: 0;
`;

const SelectionCheckbox = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  animation-delay: 0.4s;
  transition: all 0.4s;
  opacity: ${(p) => (p.hasSelection ? 1 : 0)};
  color: #fff;
  margin: 7px 14px;
  transform: translateX(${(p) => (p.hasSelection ? 0 : -50)}px);
`;

const BellIcon = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 3;
  left: 22px;
  top: 15px;
  svg {
    width: 15px;
    height: 16px;
  }
`;

const PreviewSelection = styled.div`
  position: relative;
  margin-top: 2px;
  z-index: 5;
  .icon {
    cursor: pointer;
  }

  &:hover {
    .icon {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
`;

const SelectionInfo = styled.div`
  animation: ${(p) => (p.hasSelection ? 'fadeIn' : 'fadeOut')} 0.3s;
  position: ${(p) => (p.hasSelection ? '' : 'absolute')};
  bottom: ${(p) => (p.hasSelection ? '' : '45px')};
  display: flex;
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
  position: relative;
  z-index: 3;
  input {
    position: relative;
    z-index: 2;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 10px 14px 10px 30px;
    margin: 7px 14px 0;
    height: 30px;
    outline: none;
    transition: width 0.4s;
    width: ${(p) => (p.hasSelection ? '200px' : '100%')};
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
