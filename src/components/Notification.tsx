import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { NotificationParams } from '../shared/interfaces';

const Notification: FunctionComponent<
  NotificationParams & {
    deleteNotification: (id: string) => any;
  }
> = (props) => {
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
    <NotificationContainer className={typeClass} onClick={hideNotification}>
      <span>{props.text}</span>
    </NotificationContainer>
  );
};

const NotificationContainer = styled.div`
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  height: auto;
  margin-bottom: 5px;
  width: 100%;
  background-color: #000;
  &.success {
    background-color: #1bc47d;
  }
  span {
    color: #fff;
    font-size: 12px;
  }
`;

export default Notification;
