import React from 'react';
import styled from 'styled-components';

const Checkbox = (props) => {
  return (
    <CheckboxWrapper checked={props.checked}>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        id={props.name}
        name={props.name}
      />
      <label htmlFor={props.name}>Enable tooltips</label>
      <div></div>
    </CheckboxWrapper>
  );
};

const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  height: 21px;
  input {
    display: none;
  }
  label {
  cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    width: 100%;
    height: 17px;
    padding: 4px 0 0 0;
    & + div {
      pointer-events: none;
      position: relative;
      transition: opacity 0.3s;
      opacity: ${({ checked }) => (checked ? 1 : 0.4)};
      &:after {
        content: '';
        position: absolute;
        right: 0;
        width: 35px;
        height: 21px;
        background-color: rgba(255, 255, 255, 0.46);
        border-radius: 25px;
      }
      &:before {
        content: '';
        position: absolute;
        right: 0;
        background-color: #fff;
        width: 13px;
        height: 13px;
        transition: transform 0.3s;
        transform: translate(
          ${({ checked }) => (checked ? '-4px, 4px' : '-18px, 4px')}
        );
        border-radius: 100%;
      }
    }
  }
`;

export default Checkbox;
