import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useMatch } from 'react-router-dom';
import styled from 'styled-components';

import EmojiIcon from '@fc/shared/assets/icons/EmojiIcon';
import GearIcon from '@fc/shared/assets/icons/GearIcon';
import SendArrowIcon from '@fc/shared/assets/icons/SendArrowIcon';
import { CustomLink } from '@fc/shared/components/CustomLink';
import { GiphyGrid } from '@fc/shared/components/GiphyGrid';
import Tooltip, { RefTooltip } from '@fc/shared/components/Tooltip';
import { ConnectionEnum } from '@fc/shared/utils/interfaces';

import { useStore } from '../../../store';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();
  const isSettings = useMatch('/settings');
  const emojiPickerRef = useRef(null);

  const selectionRef = useRef(null);
  const selectionTooltipRef = useRef(null);

  const [hasSelection, setHasSelection] = useState(false);
  const [isFailed, setIsFailed] = useState(
    store.status === ConnectionEnum.ERROR
  );
  const [isConnected, setIsConnected] = useState(
    store.status === ConnectionEnum.CONNECTED
  );
  const chatTextInput = useRef(null);

  useEffect(
    () =>
      autorun(() => {
        setIsFailed(store.status === ConnectionEnum.ERROR);
        setIsConnected(store.status === ConnectionEnum.CONNECTED);

        setHasSelection(Boolean(store.selectionCount));
      }),
    []
  );

  useEffect(() => {}, [props.textMessage]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatTextInput.current.value.startsWith('/giphy')) {
      props.sendMessage(e);
      chatTextInput.current.value = '';
    }
  };

  return (
    <>
      <GiphyGrid
        store={store}
        setTextMessage={(p) => {
          props.setTextMessage(p);
          chatTextInput.current.value = '';
        }}
        textMessage={props.textMessage}
      />
      <ChatBarForm isSettings={Boolean(isSettings)} onSubmit={sendMessage}>
        <ConnectionInfo isConnected={isConnected}>
          {isFailed ? 'connection failed 🙈' : 'connecting...'}
        </ConnectionInfo>

        <ChatInputWrapper>
          <RefTooltip hover ref={selectionTooltipRef} handler={selectionRef}>
            Add selection ({store.selectionCount} elements)
          </RefTooltip>
          <SettingsAndUsers>
            <CustomLink to="/settings">
              <div className="gear">
                <GearIcon />
              </div>
            </CustomLink>
            {store.status === ConnectionEnum.CONNECTED && (
              <CustomLink to="/user-list">
                <Users>
                  <UserChips>
                    {store.online
                      .filter((_, i) => i < 2)
                      .map((user) => (
                        <Chip
                          key={user.id}
                          style={{
                            backgroundColor: user.color,
                            backgroundImage: !user?.avatar
                              ? `url(${user.photoUrl})`
                              : undefined,
                          }}
                        >
                          {user?.avatar || ''}
                        </Chip>
                      ))}
                    {store.online.length > 2 && (
                      <Chip>+{store.online.length - 2}</Chip>
                    )}
                  </UserChips>
                </Users>
              </CustomLink>
            )}
          </SettingsAndUsers>

          <ChatInput isConnected={isConnected}>
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

            <Tooltip
              ref={emojiPickerRef}
              style={{
                paddingTop: 11,
                paddingBottom: 11,
                paddingLeft: 17,
                paddingRight: 17,
              }}
              handler={React.forwardRef((p, ref) => (
                <EmojiPickerStyled {...p} ref={ref}>
                  <EmojiIcon />
                </EmojiPickerStyled>
              ))}
            >
              <EmojiList>
                {['😂', '😊', '👍', '🙈', '🔥', '🤔', '💩'].map((emoji) => (
                  <span
                    key={emoji}
                    data-emoji={emoji}
                    onClick={(e) => {
                      props.setTextMessage(emoji);
                      sendMessage(e);
                      emojiPickerRef.current.hide();
                    }}
                  />
                ))}
              </EmojiList>
            </Tooltip>

            <SelectionCheckbox
              ref={selectionRef}
              color={store.settings.color}
              checked={props.selectionIsChecked}
              hasSelection={hasSelection}
              onMouseEnter={() => selectionTooltipRef.current.show()}
              onMouseLeave={() => selectionTooltipRef.current.hide()}
              onClick={() => {
                props.setSelectionIsChecked(!props.selectionIsChecked);
                chatTextInput.current.focus();
              }}
            >
              <div>{store.selectionCount < 10 && store.selectionCount}</div>
            </SelectionCheckbox>

            <SendButton color={store.settings.color} onClick={sendMessage}>
              <SendArrowIcon />
            </SendButton>
          </ChatInput>
        </ChatInputWrapper>
      </ChatBarForm>
    </>
  );
};

const GiphyHeader = styled.div`
  display: flex;
  padding: 4px 5px 12px;
  .logo {
    svg {
      width: 70px;
      height: 15px;
    }
  }
  .searchterm {
    color: #4c4c4c;
    margin-left: 6px;
  }
`;
const Giphy = styled.div`
  position: absolute;
  bottom: 54px;
  left: 9px;
  width: 315px;
  height: 250px;
  overflow: auto;
  background-color: #000;
  border-radius: 14px;
  padding: 9px;
  .overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
`;

const Users = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-left: 5px;
`;

const Chip = styled.div`
  min-width: 24px;
  overflow: hidden;
  min-height: 24px;
  max-height: 24px;
  background-color: #4b5a6a;
  background-size: cover;
  border-radius: 40px;
  padding: 2px 2px;
  text-align: center;
  color: #000;
`;

const UserChips = styled.div`
  display: flex;
  flex-direction: row-reverse;
  ${Chip} {
    margin-left: -16px;
    font-size: 14px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    &:last-child {
      margin-left: 0;
      font-size: 11px;
    }
  }
`;

const SettingsAndUsers = styled.div`
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  margin-right: 5px;
  padding: 0 6px;
  border-radius: 94px;
  display: flex;
  align-items: center;
  .gear {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(p) => p.theme.chatbarSecondaryBackground};
    border-radius: 100%;

    svg path {
      fill: ${({ theme }) => theme.thirdFontColor};
    }
  }
`;

const EmojiList = styled.div`
  display: flex;
  font-size: 25px;
  width: 240px;
  justify-content: space-between;
  span {
    cursor: pointer;
    &::after {
      content: attr(data-emoji);
    }
  }
`;

const EmojiPickerStyled = styled.div`
  /* position: absolute;
  right: 51px;
  top: 11px; */
  z-index: 5;
  cursor: pointer;
`;

const ConnectionInfo = styled.div<{ isConnected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50px;
  top: 0px;
  width: calc(100% - 70px);
  z-index: 6;
  bottom: -5px;
  text-align: center;
  color: ${(p) => p.theme.fontColor};
  font-weight: bold;
  transition: transform 0.2s;
  transform: translateY(${({ isConnected }) => (isConnected ? 69 : 0)}px);
  span {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ChatBarForm = styled.form<{ isSettings: boolean }>`
  padding: 0 9px;
  z-index: 3;
  margin: 0;
  transition: opacity 0.2s;
  position: relative;
  opacity: ${({ isSettings }) => (isSettings ? 0 : 1)};
`;

const ChatInputWrapper = styled.div`
  display: flex;
  position: relative;
`;

const ChatInput = styled.div<{ isConnected: boolean }>`
  display: grid;
  grid-template-columns: 1fr 18px auto auto;
  align-items: center;
  margin: 0;
  z-index: 3;
  transition: width 0.3s, opacity 0.3s;
  opacity: ${({ isConnected }) => (isConnected ? 1 : 0)};
  background-color: ${(p) => p.theme.secondaryBackgroundColor};
  border-radius: 94px;
  width: 100%;

  input {
    background-color: transparent;
    z-index: 2;
    font-size: 11.5px;
    font-weight: 400;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 12px 15px 12px 15px;
    height: 35px;
    outline: none;
    color: ${(p) => p.theme.fontColor};
    &::placeholder {
      color: ${(p) => p.theme.placeholder};
    }
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

const SendButton = styled.div`
  position: relative;
  display: flex;
  z-index: 3;
  cursor: pointer;
  margin: 0 4px;
  background-color: ${({ color }) => color};
  width: 27px;
  height: 27px;
  border-radius: 94px;
  justify-content: center;
  svg {
    align-self: center;
  }
`;

const SelectionCheckbox = styled.div<{
  hasSelection: boolean;
  checked: boolean;
}>`
  animation-delay: 0.2s;
  transition: all 0.2s;
  border-radius: 100%;
  height: 26px;
  margin-left: ${(p) => (p.hasSelection ? 8 : 0)}px;
  width: ${(p) => (p.hasSelection ? 26 : 0)}px;
  pointer-events: ${(p) => (p.hasSelection ? 'all' : 'none')};
  opacity: ${(p) => (p.hasSelection ? 1 : 0)};
  border: 1px solid ${(p) => (p.checked ? p.color : '#a2adc0')};
  overflow: hidden;
  display: flex;
  justify-items: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    div {
      opacity: 1;
    }
  }
  &:active {
    opacity: 0.8;
  }
  div {
    position: relative;
    min-width: 12px;
    height: 12px;
    padding: 0 2px;
    text-align: center;
    margin: 0 auto;
    background-color: ${(p) => (p.checked ? p.color : '#a2adc0')};
    color: ${(p) => p.theme.secondaryBackgroundColor};
    font-weight: bold;
    font-size: 10px;
    opacity: ${(p) => (p.checked ? 1 : 0.5)};

    &::after {
      content: '';
      position: absolute;
      height: 1px;
      top: 0;
      left: -2px;
      right: -2px;
      background-color: ${(p) => (p.checked ? p.color : '#a2adc0')};
      box-shadow: 0 11px 0px ${(p) => (p.checked ? p.color : '#a2adc0')};
    }
    &::before {
      content: '';
      position: absolute;
      width: 1px;
      left: 0;
      top: -2px;
      bottom: -2px;
      background-color: ${(p) => (p.checked ? p.color : '#a2adc0')};
      box-shadow: 11px 0px 0px ${(p) => (p.checked ? p.color : '#a2adc0')};
    }
    &:hover {
      border-color: rgba(255, 255, 255, 1);
    }
  }
`;

export default observer(ChatBar);
