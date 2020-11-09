import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import VideoCallRoundedIcon from '@material-ui/icons/VideoCallRounded';
import withStyles from '@material-ui/styles/withStyles';

const linkStyles = () => ({
  meetingLink: {
    background: 'white',
    width: '35%',
    height: 'auto',
    margin: '5% 10%',
    float: 'left',
  },
  meetingLinkTitle: {
    margin: 0,
    fontWeight: 'bold',
  },
  button: {
    position: 'relative',
    margin: '10px',
  },
  slogan: {
    fontSize: '1.25rem',
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: '2.25rem',
    paddingBottom: '.5em',
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
    for (let i = 0; i < str.length; i++) {
      if (str[i] >= '0' && str[i] <= '9') {
        str = str.replaceAt(i, String.fromCharCode(str[i].charCodeAt(0) + 49));
      }
    }

    return str.slice(0, 3) + '-' + str.slice(3, 7) +
        '-' + str.slice(7, 10);
  }

  johnMeeting = () => {
    if (this.state.urlBackHalf !== '') {
      // Join existing room
    } else {
      const urlBackHalf = this.generateUrlBackHalf();
      window.location.href = `/${urlBackHalf}`;
    }
  }

  render() {
    const classes = this.props.classes;
    return (
      <Container className={classes.meetingLink}>
        <Typography variant="h6" align="center"
          className={classes.meetingLinkTitle}>
            Start a meeting
        </Typography>
        <Button variant="contained" color="primary" className={classes.button}
          startIcon = {<VideoCallRoundedIcon />}
          onClick={this.johnMeeting}>Join Meeting</Button>
      </Container>
    );
  }
}

export default withStyles(linkStyles)(MeetingLink);
