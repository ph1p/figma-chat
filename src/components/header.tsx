import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  title: any;
  left?: any;
  right?: any;
  backButton?: boolean;
}

const Header: FunctionComponent<Props> = props => (
  <Head>
    <div className="inner">
      {props.backButton && (
        <Link className="back-button" to="/">
          <div className="icon icon--return"></div>
        </Link>
      )}
      {props.left && <div className="left">{props.left}</div>}
      <div className="title">{props.title}</div>
      {props.right && <div className="right">{props.right}</div>}
    </div>
  </Head>
);

const Head = styled.div`
  border-bottom: 1px solid #e9e9e9;

  .inner {
    display: grid;
    grid-template-columns: auto 1fr auto;
    width: 100%;
    .back-button,
    .left {
      border-right: 1px solid #e9e9e9;
      cursor: pointer;
    }
    .left {
    }
    .title {
      padding: 0 10px;
      font-weight: bold;
      align-self: center;
    }
    .right {
    }
    .icon {
      cursor: pointer;
    }
  }
`;

export default Header;
