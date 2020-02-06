import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { NotificationParams } from '../shared/interfaces';

const Notification: FunctionComponent<NotificationParams & {
  deleteNotification: (id: string) => any;
}> = props => {
  const [tm, setTm] = useState(null);
  const hideNotification = () => props.deleteNotification(props.id);

  useEffect(() => {
    setTm(setTimeout(hideNotification, 3000));

    return () => clearTimeout(tm);
  }, []);

  let typeClass = '';

  if (props.type === 'success') {
    typeClass = 'success';
  } else if (props.type === 'error') {
    typeClass = 'visual-bell--error';
  }

  return (
    <NotificationContainer
      className={`visual-bell ${typeClass}`}
      onClick={hideNotification}
    >
      <span className="visual-bell__msg">{props.text}</span>
    </NotificationContainer>
  );
};

const NotificationContainer = styled.div`
  cursor: pointer;
  padding: 8px 16px;
  height: auto;
  margin-bottom: 5px;
  width: 100%;
  &.success {
    background-color: #1bc47d;
  }
  span {
    font-size: 13px;
  }
`;

export default Notification;
