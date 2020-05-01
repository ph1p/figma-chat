import React, { FunctionComponent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { NotificationParams } from '../shared/interfaces';
import Notification from './Notification';
// store
import { observer } from 'mobx-react';
import { useStore } from '../store';
import { autorun, reaction } from 'mobx';

const Notifications: FunctionComponent = () => {
  const store = useStore();
  const location = useLocation();
  const [isRoot, setIsRoot] = useState(true);

  useEffect(() => {
    setIsRoot(location.pathname === '/');
  }, [location]);

  const deleteNotification = (id: string) =>
    store.notifications.splice(
      store.notifications.findIndex((n) => n.id === id),
      1
    );

  if (store.notifications.length === 0) return null;

  return (
    <NotificationsContainer isRoot={isRoot}>
      {store.notifications.map((data: NotificationParams, key) => (
        <Notification
          key={key}
          {...data}
          deleteNotification={() => deleteNotification(data.id)}
        />
      ))}
    </NotificationsContainer>
  );
};

const NotificationsContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  position: absolute;
  bottom: ${(props) => (props.isRoot ? 39 : 0)}px;
  z-index: 11;
  padding: 10px;
  width: 100%;
`;

export default observer(Notifications);
