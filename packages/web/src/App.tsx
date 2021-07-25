import { Chat } from '@web/views/Chat';
import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Chat />
        </Route>
      </Switch>
    </Router>
  );
};
