import React, {
  FunctionComponent,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import { useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import styled from 'styled-components';
import ColorPicker from './ColorPicker';
import { useStore } from '../store';
import { ConnectionEnum } from '../shared/interfaces';
import Tooltip from './Tooltip';

interface ChatProps {
  sendMessage: (event: any) => void;
  setTextMessage: (text: string) => void;
  textMessage: string;
  setSelectionIsChecked: (event: any) => void;
  selectionIsChecked: boolean;
}

const ChatBar: FunctionComponent<ChatProps> = (props) => {
  const store = useStore();
  const isSettings = useRouteMatch('/settings');
  const [hasSelection, setHasSelection] = useState(false);
  const [isFailed, setIsFailed] = useState(
    store.status === ConnectionEnum.ERROR
  );
  const [isConnected, setIsConnected] = useState(
    store.status === ConnectionEnum.CONNECTED
  );
  const chatTextInput = useRef(null);
  const emojiTooltipRef = React.createRef<any>();

  useEffect(
    () =>
      autorun(() => {
        setIsFailed(store.status === ConnectionEnum.ERROR);
        setIsConnected(store.status === ConnectionEnum.CONNECTED);

        setHasSelection(Boolean(store.selectionCount));
      }),
    []
  );

  return (
    <ChatBarForm
      isSettings={isSettings}
      onSubmit={(e) => {
        props.sendMessage(e);
        chatTextInput.current.value = '';
      }}
    >
      <ConnectionInfo isConnected={isConnected}>
        {isFailed ? <>connection failed 🙈</> : 'connecting...'}
      </ConnectionInfo>

      <ChatInputWrapper isConnected={isConnected}>
        <SelectionCheckbox
          checked={props.selectionIsChecked}
          hasSelection={hasSelection}
          onClick={(e: any) => {
            props.setSelectionIsChecked(!props.selectionIsChecked);
            chatTextInput.current.focus();
          }}
        >
          <div>{store.selectionCount}</div>
        </SelectionCheckbox>
        <ChatInput hasSelection={hasSelection}>
          {/* <BellIcon
            onClick={() =>
              (store.settings.enableNotificationSound = !store.settings
                .enableNotificationSound)
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 15 16"
            >
              {store.settings.enableNotificationSound ? (
                <path
                  fill={store.settings.color}
                  fillRule="evenodd"
                  d="M11 5v4l1 1H2l1-1V5a4 4 0 018 0zm1 4a2 2 0 002 2H0a2 2 0 002-2V5a5 5 0 0110 0v4zm-5 5l-2-2H4a3 3 0 106 0H9l-2 2z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fill={store.settings.color}
                  fillRule="evenodd"
                  d="M4.998 11.472h9.475v-.882a1.76 1.76 0 01-1.764-1.765v-3.53a5.31 5.31 0 00-.134-1.188l-.88.854c.01.11.014.222.014.334v3.53c0 .617.202 1.187.544 1.647H6.027l-1.029 1zm5.718-8.924a4.295 4.295 0 00-7.597 2.747v3.53c0 .604-.194 1.162-.522 1.617l-1.06 1.03H.354v-.882a1.76 1.76 0 001.765-1.765v-3.53a5.295 5.295 0 019.315-3.445l-.718.698zm-5.009 9.807a1.706 1.706 0 103.413 0h1a2.706 2.706 0 11-5.413 0h1zM0 14.146l14-14 .707.708-14 14L0 14.146z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </BellIcon> */}
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
          {/* <ColorPicker /> */}

          <Tooltip
            id="emoji"
            ref={emojiTooltipRef}
            horizontalSpacing={30}
            // position="bottom"
            handler={React.forwardRef((props, ref) => (
              <EmojiPickerStyled
                data-for="emoji"
                data-tip="custom show"
                data-effect="solid"
                data-event="click"
                {...props}
                ref={ref}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                >
                  <path
                    fill="#A2ADC0"
                    d="M9.153 13.958a5.532 5.532 0 01-5.122-3.41.394.394 0 01.585-.482.396.396 0 01.146.178 4.741 4.741 0 004.391 2.923c.625 0 1.244-.124 1.82-.365a4.72 4.72 0 002.558-2.558.396.396 0 01.73.305 5.51 5.51 0 01-2.984 2.983 5.499 5.499 0 01-2.124.426z"
                  />
                  <path
                    fill="#A2ADC0"
                    d="M9 18c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9zM9 .75C4.451.75.75 4.451.75 9c0 4.549 3.701 8.25 8.25 8.25 4.549 0 8.25-3.701 8.25-8.25C17.25 4.451 13.549.75 9 .75z"
                  />
                  <circle cx="11.646" cy="6" r="1" fill="#A2ADC0" />
                  <circle cx="6.646" cy="6" r="1" fill="#A2ADC0" />
                </svg>
              </EmojiPickerStyled>
            ))}
          >
            <EmojiList>
              <span data-emoji="😂" />
              <span data-emoji="😊" />
              <span data-emoji="👍" />
              <span data-emoji="🙈" />
              <span data-emoji="🔥" />
              <span data-emoji="🤔" />
              <span data-emoji="💩" />
            </EmojiList>
          </Tooltip>

          <SendButton color={store.settings.color}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.38396 1.47595H8.55196M8.55196 1.47595V7.64395M8.55196 1.47595L1.35596 8.67195"
                stroke="white"
                strokeWidth="1.028"
              />
            </svg>
          </SendButton>
        </ChatInput>
      </ChatInputWrapper>
    </ChatBarForm>
  );
};

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
  position: absolute;
  right: 51px;
  top: 11px;
  z-index: 5;
  cursor: pointer;
`;

const ConnectionInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 6;
  bottom: -5px;
  text-align: center;
  color: #000;
  font-weight: bold;
  transition: transform 0.2s;
  transform: translateY(${({ isConnected }) => (isConnected ? 69 : 0)}px);
  span {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ChatBarForm = styled.form`
  padding: 14px;
  z-index: 3;
  margin: 0;
  transition: opacity 0.2s;
  position: relative;
  opacity: ${({ isSettings }) => (isSettings ? 0 : 1)};
`;

const ChatInputWrapper = styled.div`
  display: flex;
  transition: opacity 0.3s;
  opacity: ${({ isConnected }) => (isConnected ? 1 : 0)};
  position: relative;
`;

const ChatInput = styled.div`
  display: flex;
  margin: 0;
  z-index: 3;
  transition: width 0.3s;
  background-color: #eceff4;
  border-radius: 10px 10px 0 10px;
  /* width: ${(p) => (p.hasSelection ? '225px' : '100%')}; */
  width: 100%;

  input {
    background-color: transparent;
    z-index: 2;
    font-size: 11.5px;
    font-weight: 300;
    border-radius: 6px;
    width: 100%;
    border: 0;
    padding: 14px 30px 14px 18px;
    height: 41px;
    outline: none;
    &::placeholder {
      color: #a2adc0;
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
  position: absolute;
  display: flex;
  z-index: 3;
  right: 4px;
  top: 4px;
  background-color: ${({ color }) => color};
  width: 33px;
  height: 33px;
  border-radius: 9px 9px 4px 9px;
  justify-content: center;
  svg {
    align-self: center;
  }
`;

const SelectionCheckbox = styled.div`
  animation-delay: 0.2s;
  transition: all 0.2s;
  background-color: #eceff4;
  border-radius: 10px;
  height: 41px;
  width: ${(p) => (p.hasSelection ? 49 : 0)}px;
  margin-right: ${(p) => (p.hasSelection ? 8 : 0)}px;
  opacity: ${(p) => (p.hasSelection ? 1 : 0)};
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
  div {
    position: relative;
    min-width: 12px;
    height: 12px;
    padding: 0 2px;
    text-align: center;
    margin: 0 auto;
    background-color: #a2adc0;
    color: #eceff4;
    font-weight: bold;
    font-size: 10px;
    opacity: ${(p) => (p.checked ? 1 : 0.5)};
    &::after {
      content: '';
      position: absolute;
      height: 1px;
      top: 0;
      left: -3px;
      right: -3px;
      background-color: #a2adc0;
      box-shadow: 0 11px 0px #a2adc0;
    }
    &::before {
      content: '';
      position: absolute;
      width: 1px;
      left: 0;
      top: -3px;
      bottom: -3px;
      background-color: #a2adc0;
      box-shadow: 11px 0px 0px #a2adc0;
    }
    &:hover {
      border-color: rgba(255, 255, 255, 1);
    }
  }
`;

export default observer(ChatBar);
