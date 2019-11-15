import React from 'react';
import { MemoryRouter as Router, Switch, Link, Route } from 'react-router-dom';
import * as ReactDOM from 'react-dom';
import './assets/figma-ui/main.min.css';
import './assets/css/ui.css';

import { sendMainMessage, DEFAULT_SERVER_URL } from './utils';
import SettingsScreen from './containers/settings';
import ChatScreen from './containers/chat';

let CURRENT_SERVER_URL;

// initialize
sendMainMessage('initialize');
onmessage = message => {
  if (message.data.pluginMessage) {
    const { type, payload } = message.data.pluginMessage;

    if (type === 'initialize') {
      if (payload !== '') {
        CURRENT_SERVER_URL = payload;
        init(payload);
      } else {
        init();
      }
    }
  }
};

const init = (SERVER_URL = 'https://figma-chat.ph1p.dev/') => {
  const App = () => {
    return (
      <Switch>
        <Route exact path="/">
          <ChatScreen />
        </Route>
        <Route path="/settings">
          <SettingsScreen />
        </Route>
        <Route path="/user-list">
          <div>user list</div>
        </Route>
      </Switch>
    );
  };

  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('app')
  );
};
