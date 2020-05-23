import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import styled, { css } from 'styled-components';
import { usePopper } from 'react-popper';

interface Props {
  handler: any;
  hover?: boolean;
  children: any;
  placement?: 'top' | 'bottom';
}

const TooltipComponent: FunctionComponent<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handler: HandlerComp } = props;

  const wrapperRef = useRef(null);
  const handlerRef = useRef(null);

  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(handlerRef.current, popperElement, {
    placement: props.placement || 'top',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'arrow',
        options: {
          element: arrowElement,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 14],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 14,
        },
      },
    ],
  });

  useEffect(() => {
    if (!props.hover) {
      function handleClick(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef}>
      <div
        onClick={() => !props.hover && setIsOpen(!isOpen)}
        onMouseEnter={() => props.hover && setIsOpen(!isOpen)}
        onMouseLeave={() => props.hover && setIsOpen(!isOpen)}
      >
        <HandlerComp ref={handlerRef} />
      </div>

      {isOpen && (
        <Tooltip
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <TooltipContent>{props.children}</TooltipContent>
          <Arrow ref={setArrowElement} style={styles.arrow}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="-1"
                y="14.0002"
                width="21.2135"
                height="21.2135"
                rx="3"
                transform="rotate(-45 -1 14.0002)"
                fill="#1E1940"
              />
            </svg>
          </Arrow>
        </Tooltip>
      )}
    </div>
  );
};

const TooltipContent = styled.div`
  padding: 11px 17px;
`;

const Arrow = styled.div`
  position: absolute;
  width: 21px;
  height: 21px;
  overflow: hidden;
  border-radius: 4px;
  pointer-events: none;
  svg {
    height: 21px;
    width: 21px;
  }
`;

const Tooltip = styled.div`
  position: fixed;
  background-color: #1e1940;
  border-radius: 20px;
  opacity: 1;
  z-index: 4;
  color: #fff;
  box-shadow: 0 10px 34px rgba(30, 25, 64, 0.34);
  &[data-popper-placement^='top'] {
    ${Arrow} {
      bottom: -7px;
    }
  }
  &[data-popper-placement^='bottom'] {
    ${Arrow} {
      top: -7px;
    }
  }
  &.place-left {
    &::after {
      margin-top: -10px;
    }
  }
`;

export default TooltipComponent;
