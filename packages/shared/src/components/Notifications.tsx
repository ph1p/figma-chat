// store
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { NotificationParams } from '@fc/shared/utils/interfaces';

import Notification from './Notification';

interface Props {
  notifications: NotificationParams[];
  deleteNotification: (id: number) => void;
}

const Notifications: FunctionComponent<Props> = (props: Props) => {
  const location = useLocation();
  const [isRoot, setIsRoot] = useState(true);

  useEffect(() => {
    setIsRoot(location.pathname === '/');
  }, [location]);

  if (props.notifications.length === 0) return null;

  return (
    <NotificationsContainer isRoot={isRoot}>
      {props.notifications.map((data: NotificationParams, key) => (
        <Notification
          key={key}
          {...data}
          deleteNotification={() => props.deleteNotification(data.id)}
        />
      ))}
    </NotificationsContainer>
  );
};

const NotificationsContainer = styled.div<{ isRoot: boolean }>`
  display: flex;
  flex-direction: column-reverse;
  position: absolute;
  top: 37px;
  z-index: 11;
  padding: 11px;
  width: 100%;
  align-items: center;
`;

export default observer(Notifications);
