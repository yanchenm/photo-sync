import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import LoginPage from './auth/LoginPage';
import PhotosPage from './photos/PhotosPage';
import React from 'react';
import SignUpPage from './auth/SignUpPage';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/photos">
          <PhotosPage />
        </Route>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/signup">
          <SignUpPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
