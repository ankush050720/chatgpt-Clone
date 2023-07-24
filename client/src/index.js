import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import GoogleLoginPage from './GoogleLoginPage';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/" exact component={GoogleLoginPage} />
      <Route path="/app" component={App} />
      <Route path="/" component={() => <div>404 Not Found</div>} />
    </Switch>
  </Router>,
  document.getElementById('root')
);

reportWebVitals();
