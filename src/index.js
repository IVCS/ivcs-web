import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import HomePage from './HomePage';
import MeetingRoom from './MeetingRoom';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/:url" component={MeetingRoom} />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
