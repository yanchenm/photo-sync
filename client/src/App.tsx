import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import HomePage from './common/HomePage';
import LoginPage from './auth/LoginPage';
import PhotoDetails from './photos/PhotoDetails';
import React from 'react';
import SignUpPage from './auth/SignUpPage';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return <Redirect to="/photos" />;
          }}
        />
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <Route exact path="/signup">
          <SignUpPage />
        </Route>
        <Route exact path="/photos/:id">
          <PhotoDetails />
        </Route>
        <Route path="/:page">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
