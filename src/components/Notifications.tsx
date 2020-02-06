import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { NotificationParams } from '../shared/interfaces';
import { state, view } from '../shared/state';
import Notification from './Notification';

const Notifications: FunctionComponent = () => {
  const deleteNotification = (id: string) =>
    state.notifications.splice(
      state.notifications.findIndex(n => n.id === id),
      1
    );

  if (state.notifications.length === 0) return null;

  return (
    <NotificationsContainer>
      {state.notifications.map((data: NotificationParams, key) => (
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
  position: absolute;
  top: 0;
  z-index: 1;
  padding: 10px;
  width: 100%;
`;

export default view(Notifications);
