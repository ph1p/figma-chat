import styled from 'styled-components';

export const SharedIcon = styled.div`
  .icon {
    margin: 5px;
    height: 22px;
    width: 24px;
    background-position: -4px -5px;
    border-radius: 5px;
    &--white {
      background-position: -4px -101px;
    }
  }
  &:hover {
    .icon {
      background-color: rgba(0, 0, 0, 0.06);
    }
  }
`;
