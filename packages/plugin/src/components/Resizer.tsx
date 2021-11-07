import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import EventEmitter from '../shared/EventEmitter';

export const Resizer = () => {
  const [dragStart, _setDragStart] = useState(false);
  const dragStartRef = useRef(dragStart);
  const setDragStart = (x) => {
    dragStartRef.current = x;
    _setDragStart(x);
  };

  const [sizeAndPosition, _setSizeAndPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const sizeAndPositionRef = useRef(sizeAndPosition);
  const setSizeAndPosition = (x) => {
    sizeAndPositionRef.current = x;
    _setSizeAndPosition(x);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStart(true);

    setSizeAndPosition({
      x: e.clientX,
      y: e.clientY,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStart(false);
    console.log('onMouseUp');
  };

  const onMouseMove = (e) => {
    e.preventDefault();
    if (dragStartRef.current) {
      EventEmitter.emit('resize', {
        height:
          sizeAndPositionRef.current.height +
          (e.clientY - sizeAndPositionRef.current.y),
        width:
          sizeAndPositionRef.current.width +
          (e.clientX - sizeAndPositionRef.current.x),
      });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return <ResizerElement onMouseDown={onMouseDown} />;
};

const ResizerElement = styled.div`
  position: fixed;
  right: 0;
  bottom: 1px;
  width: 15px;
  height: 15px;
  z-index: 100;
  cursor: nwse-resize;
  &::after {
    content: '';
    transform: rotate(-45deg);
    transform-origin: 50%;
    position: absolute;
    top: 6px;
    left: 2px;
    width: 10px;
    height: 1px;
    background-color: rgb(165 165 165);
    box-shadow: 0px 3px 0px 0px rgb(165 165 165);
  }
`;
