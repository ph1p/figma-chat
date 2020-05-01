import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { NotificationParams } from '../shared/interfaces';
import Notification from './Notification';
// store
import { observer } from 'mobx-react';
import { useStore } from '../store';

const Notifications: FunctionComponent = () => {
  const store = useStore();

  const deleteNotification = (id: string) =>
    store.notifications.splice(
      store.notifications.findIndex((n) => n.id === id),
      1
    );

  if (store.notifications.length === 0) return null;

  return (
    <NotificationsContainer>
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
  bottom: 39px;
  z-index: 11;
  padding: 10px;
  width: 100%;
`;

export default observer(Notifications);
