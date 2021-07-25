import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled, { css } from 'styled-components';

interface Props {
  handler?: any;
  hover?: boolean;
  shadow?: boolean;
  children: any;
  style?: any;
  offsetHorizontal?: number;
  placement?: 'top' | 'bottom';
}

export const RefTooltip = React.forwardRef<any, Props>((props, ref: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popperElement, setPopperElement] = useState<any>();
  const [arrowElement, setArrowElement] = useState<any>();

  const { styles, attributes } = usePopper(
    props.handler.current,
    popperElement,
    {
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
            offset: [0, props.hover ? 7 : 14],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: props.offsetHorizontal || 14,
          },
        },
      ],
    }
  );

  const wrapperRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show: () => setIsOpen(true),
    hide: () => setIsOpen(false),
  }));

  return (
    <div ref={wrapperRef}>
      {isOpen && (
        <Tooltip
          isOpen={isOpen}
          hover={props.hover}
          shadow={props.shadow}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <TooltipContent hover={props.hover} style={props.style}>
            {props.children}
          </TooltipContent>
          <Arrow ref={setArrowElement} style={styles.arrow} />
        </Tooltip>
      )}
    </div>
  );
});

const TooltipComponent = React.forwardRef<any, Props>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handler: HandlerComp } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<HTMLDivElement>(null);

  const [popperElement, setPopperElement] = useState<any>();
  const [arrowElement, setArrowElement] = useState<any>();

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
          offset: [0, props.hover ? 7 : 14],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: props.offsetHorizontal || 14,
        },
      },
    ],
  });

  useImperativeHandle(ref, () => ({
    hide: () => setIsOpen(false),
  }));

  useEffect(() => {
    if (!props.hover) {
      const handleClick = (event: any) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

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
          isOpen={isOpen}
          hover={props.hover}
          shadow={props.shadow}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <TooltipContent hover={props.hover} style={props.style}>
            {props.children}
          </TooltipContent>
          <Arrow ref={setArrowElement} style={styles.arrow} />
        </Tooltip>
      )}
    </div>
  );
});

const TooltipContent = styled.div<{ hover?: boolean }>`
  padding: ${(p) => (p.hover ? '5px 10px' : 15)};
  position: relative;
  z-index: 1;
  font-weight: normal;
`;

const Arrow = styled.div`
  position: absolute;
  width: 21px;
  height: 21px;
  pointer-events: none;
  &::before {
    content: '';
    position: absolute;
    width: 21px;
    height: 21px;
    background-color: ${(p) => p.theme.tooltipBackgroundColor};
    transform: rotate(45deg);
    top: 0px;
    left: 0px;
    border-radius: 4px;
    z-index: -1;
  }
`;

const Tooltip = styled.div<{
  hover?: boolean;
  isOpen?: boolean;
  shadow?: boolean;
}>`
  position: fixed;
  background-color: ${(p) => p.theme.tooltipBackgroundColor};
  border-radius: ${(p) => (p.hover ? 6 : 20)}px;
  visibility: ${(p) => (p.isOpen ? 'visible' : 'hidden')};
  pointer-events: ${(p) => (p.isOpen ? 'all' : 'none')};
  z-index: 4;
  color: ${(p) => p.theme.fontColorInverse};

  ${(p) =>
    p.shadow
      ? css`
          box-shadow: 0px 24px 34px ${({ theme }) => theme.tooltipShadow};
        `
      : ''}

  &-enter {
    opacity: 0;
  }
  &-enter-active {
    opacity: 1;
    transition: opacity 200ms ease-in, transform 200ms ease-in;
  }
  &-exit {
    opacity: 1;
  }
  &-exit-active {
    opacity: 0;
    transition: opacity 200ms ease-in, transform 200ms ease-in;
  }

  &[data-popper-placement^='top'] {
    ${Arrow} {
      bottom: ${(p) => (p.hover ? -1 : -4)}px;
    }
  }
  &[data-popper-placement^='bottom'] {
    ${Arrow} {
      top: ${(p) => (p.hover ? -1 : -4)}px;
    }
  }
  &.place-left {
    &::after {
      margin-top: -10px;
    }
  }
`;

export default TooltipComponent;
