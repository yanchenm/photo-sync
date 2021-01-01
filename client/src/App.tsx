import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Login from './pages/Login';
import Photos from './pages/Photos';
import React from 'react';
import SignUp from './pages/SignUp';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/photos">
          <Photos />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/signup">
          <SignUp />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
