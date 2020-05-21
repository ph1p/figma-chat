import React, { useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useStore } from '../store';

interface Props {
  handler: any;
  id: string;
  children: any;
  position?: 'top' | 'bottom';
  spacing?: number;
  arrowSpacing?: number;
  horizontalSpacing?: number;
}

const TooltipComponent = React.forwardRef<HTMLDivElement, Props>(
  (props, forwardedRef) => {
    const FIGMA_HEADER_HEIGHT = 41;
    const [isOpen, setIsOpen] = useState(false);
    const { handler: HandlerComp } = props;
    const [arrowPosition, setArrowPosition] = useState({
      left: 0,
      top: 0,
    });
    const [tooltipPosition, setTooltipPosition] = useState({
      top: 0,
      left: 0,
    });

    const [handleStyle, setHandleStyle] = useState({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    });
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);
    const handlerRef = useRef(null);

    useEffect(() => {
      function handleClick(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [wrapperRef]);

    useEffect(() => {
      if (handlerRef.current) {
        const {
          top,
          left,
          width,
          height,
        } = handlerRef.current.getBoundingClientRect();

        setHandleStyle({
          top,
          left,
          width,
          height,
        });
      }
    }, [isOpen]);

    useEffect(() => {
      if (tooltipRef.current) {
        const {
          top,
          left,
          width,
          height,
        } = tooltipRef.current.getBoundingClientRect();

        const spacing = props.spacing || 14;
        const arrowSpacing = props.arrowSpacing || 0;
        const horizontalSpacing = props.horizontalSpacing || 0;

        const tooltipPaddingRight = 17;
        const tooltipPaddingTop = 11;

        const arrowSize = 19;

        if (!props.position || props.position === 'top') {
          setArrowPosition({
            left:
              width -
              arrowSize -
              tooltipPaddingRight +
              arrowSpacing -
              horizontalSpacing,
            top: height - arrowSize,
          });

          // top left
          setTooltipPosition({
            left:
              handleStyle.left -
              width +
              tooltipPaddingRight * 2 +
              horizontalSpacing,
            top:
              handleStyle.top -
              FIGMA_HEADER_HEIGHT -
              handleStyle.height -
              spacing,
          });
        } else if (props.position === 'bottom') {
          setArrowPosition({
            left:
              width -
              arrowSize -
              tooltipPaddingRight +
              arrowSpacing -
              horizontalSpacing,
            top: -3,
          });

          // top left
          setTooltipPosition({
            left:
              handleStyle.left -
              handleStyle.width -
              width +
              tooltipPaddingRight * 2 +
              tooltipPaddingRight +
              horizontalSpacing,
            top:
              handleStyle.top +
              FIGMA_HEADER_HEIGHT +
              handleStyle.height * 2 +
              spacing,
          });
        }

        console.log(tooltipRef.current.getBoundingClientRect());
      }
    }, [isOpen, handleStyle]);

    return (
      <div ref={forwardedRef}>
        <Wrapper ref={wrapperRef}>
          <HandlerComp ref={handlerRef} onClick={() => setIsOpen(!isOpen)} />
          {isOpen && (
            <Tooltip
              id={props.id}
              style={tooltipPosition}
              arrowTop={arrowPosition.top}
              arrowLeft={arrowPosition.left}
              ref={tooltipRef}
            >
              <TooltipContent onClick={(e) => e.stopPropagation()}>
                {props.children}
              </TooltipContent>
            </Tooltip>
          )}
        </Wrapper>
      </div>
    );
  }
);

const Wrapper = styled.div``;
const Handler = styled.div`
  width: auto;
  height: auto;
`;

const TooltipContent = styled.div`
  padding: 11px 17px;
`;
const Tooltip = styled.div`
  position: fixed;
  background-color: #1e1940;
  border-radius: 20px;
  opacity: 1;
  z-index: 4;
  color: #fff;
  &.place-left {
    &::after {
      margin-top: -10px;
    }
  }

  &::after {
    content: ' ';
    position: absolute;
    left: ${(p) => p.arrowLeft}px;
    top: ${(p) => p.arrowTop}px;
    width: 21px;
    height: 21px;
    background-color: #1e1940;
    transform: rotate(45deg);
    border-radius: 4px;
    pointer-events: none;
    z-index: -1;
  }
`;

export default TooltipComponent;
