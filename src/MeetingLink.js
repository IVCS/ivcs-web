import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {withStyles} from '@material-ui/styles';

const styles = () => ({
  meetingLink: {
    background: 'white',
    width: '35%',
    height: 'auto',
    margin: '10%',
    float: 'left',
  },
  meetingLinkTitle: {
    margin: 0,
    fontWeight: 'bold',
    paddingRight: '50px',
  },
});

class MeetingLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {urlBackHalf: ''};
  }

  generateUrlBackHalf = () => {
    let str = (Math.random().toString(36).substr(2, 10) +
        Math.random().toString(36).substr(2, 10)).
        replace(/[^a-z]+/g, '').substr(0, 10);


    // Make sure that all characters in the string are lowercase letters.
    // eslint-disable-next-line no-extend-native
    String.prototype.replaceAt = function(index, replacement) {
      return this.substr(0, index) + replacement +
          this.substr(index + replacement.length);
    };
    for (let i=0; i<str.length; i++) {
      if (str[i] >= '0' && str[i] <= '9') {
        str = str.replaceAt(i, String.fromCharCode(str[i].charCodeAt(0) + 49));
      }
    }


    return str.slice(0, 3) + '-' + str.slice(3, 7) +
        '-' + str.slice(7, 10);
  }

  johnMeeting = () => {
    if (this.state.urlBackHalf === '') {
      const urlBackHalf = this.generateUrlBackHalf();
      console.log(urlBackHalf);
      window.location.href = `/${urlBackHalf}`;
    }
  }

  render() {
    const {classes} = this.props;
    return (
      <Container className={classes.meetingLink}>
        <Typography component="p" className={classes.meetingLinkTitle}>
          Start or join a meeting
        </Typography>
        <Button onClick={this.johnMeeting}>Click me</Button>
      </Container>
    );
  }
}

export default withStyles(styles)(MeetingLink);
