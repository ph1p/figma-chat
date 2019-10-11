import * as React from 'react';

export default function UserList(props) {
  const closeUserList = () => props.setUserListView(false);

  return (
    <div className="user-list">
      <div className="header">
        <div className="onboarding-tip">
          <div className="onboarding-tip__icon" onClick={closeUserList}>
            <div className="icon icon--close icon--button" />
          </div>
          <div className="onboarding-tip__msg">Currently present users</div>
        </div>
      </div>

      <div className="users">
        {props.online.map(user => (
          <div
            key={user.id}
            className="user"
          >
            <div className="color" style={{ backgroundColor: user.color || '#000' }}></div>
            <div className="name">{user.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
