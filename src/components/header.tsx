import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

interface Props {
  title: string;
  left?: any;
  right?: any;
  backButton?: boolean;
}

const Header: FunctionComponent<Props> = props => {
  const history = useHistory();
  const goBack = () => history.push('/');

  return (
    <Head>
      <div className="inner">
        {props.backButton && (
          <div className="back-button" onClick={goBack}>
            <div className="icon icon--return"></div>
          </div>
        )}
        {props.left && <div className="left">{props.left}</div>}
        <div className="title">{props.title}</div>
        {props.right && <div className="right">{props.right}</div>}
      </div>
    </Head>
  );
};

const Head = styled.div`
  border-bottom: 1px solid #e9e9e9;

  .inner {
    display: grid;
    grid-template-columns: auto 1fr auto;
    width: 100%;
    .back-button,
    .left {
      border-right: 1px solid #e9e9e9;
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
  }

  .user-online {
    cursor: pointer;
  }

  .onboarding-tip {
    padding: 0;
  }

  .minimize-chat {
    cursor: pointer;
    border-left: 1px solid #e9e9e9;
    margin-left: 10px;
  }

  .onboarding-tip__msg {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .onboarding-tip__icon {
    border-right: 1px solid #e9e9e9;
  }

  .icon {
    cursor: pointer;
  }
`;

export default Header;
