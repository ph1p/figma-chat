import React, { useState, useEffect, useRef, FunctionComponent } from 'react';
import styled from 'styled-components';

import { state, view } from '../shared/state';
import { colors } from '../shared/constants';
import { withSocketContext } from '../shared/SocketProvider';

interface Props {
  socket?: SocketIOClient.Socket;
}

const ColorPicker: FunctionComponent<Props> = view((props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [wrapperRef]);

  return (
    <Wrapper ref={wrapperRef}>
      <CurrentColor
        color={state.settings.color}
        onClick={() => setIsOpen(!isOpen)}
      />

      <Picker isOpen={isOpen}>
        {Object.keys(colors).map((color) => (
          <div
            key={color}
            onClick={() => {
              setIsOpen(false);
              state.persistSettings(
                {
                  color,
                },
                props.socket
              );
            }}
            className={`color ${state.settings.color === color && ' active'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </Picker>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  position: absolute;
  right: 22px;
  top: 10px;
  z-index: 4;
`;

const CurrentColor = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background-color: ${({ color }) => color};
  cursor: pointer;
`;

const Picker = styled.div`
  position: absolute;
  pointer-events: ${({ isOpen }) => (isOpen ? 'all' : 'none')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  background-color: #000;
  left: -240px;
  top: -51px;
  border-radius: 8px;
  display: flex;
  padding: 10px;
  width: 265px;
  justify-content: space-between;
  &::after {
    top: 100%;
    right: 11px;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-top-color: #000;
    border-width: 8px;
    margin-left: -8px;
  }
  .color {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 100%;
    cursor: pointer;
    &:hover::after {
      background-color: #fff;
    }
    &.active::after {
      background-color: #fff;
    }
    &::after {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      top: 50%;
      left: 50%;
      background-color: transparent;
      border-radius: 100%;
      transform: translate(-50%, -50%);
    }
  }
`;

export default withSocketContext(ColorPicker);
