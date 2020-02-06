import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SharedIcon } from '../shared/style';

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
        <SharedIcon>
          <Link to="/">
            <div className="icon icon--return"></div>
          </Link>
        </SharedIcon>
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
    .left {
      cursor: pointer;
    }
    .title {
      padding: 0 10px 0 2px;
      font-weight: bold;
      align-self: center;
    }
    .icon {
      cursor: pointer;
    }
  }
`;

export default Header;
