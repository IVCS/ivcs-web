import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import HomePage from './HomePage';
import MeetingRoom from './MeetingRoom';
import Typography from '@material-ui/core/Typography';

class App extends React.Component {
  isChrome = () => {
    return /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor);
  }

  render() {
    if (!this.isChrome()) {
      return (
        <Typography align="center" color="primary" variant="h2">
          <br/><br/>Sorry, IVCS is only available for testing on Google Chrome
          at this time.
          <br/><br/>Our team will add support for other browsers in the future.
        </Typography>
      );
    } else {
      return (
        <Router>
          <Switch>
            <Route exact path="/" component={HomePage}/>
            <Route path="/:url" component={MeetingRoom}/>
          </Switch>
        </Router>
      );
    }
  }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root'),
);
