import React from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import VideoCallRoundedIcon from '@material-ui/icons/VideoCallRounded';
import withStyles from '@material-ui/styles/withStyles';

const styles = () => ({
  meetingLink: {
    position: 'absolute',
    width: '30%',
    height: 'auto',
    margin: '5% 5%',
    top: '60%',
    right: '55%',
    float: 'left',
    borderRadius: '15px',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  meetingLinkTitle: {
    margin: 0,
    fontWeight: 'bold',
  },
  button: {
    position: 'relative',
    margin: '10px',
  },
});

class MeetingLink extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state = {urlBackHalf: ''};
  }

  generateUrlBackHalf = () => {
    let str = (Math.random().toString(36).substr(2, 10) +
        Math.random().toString(36).substr(2, 10)).
        replace(/[^a-z]+/g, '').substr(0, 10);

    // Make sure that all characters in the string are lowercase letters.
    for (let i = 0; i < str.length; i++) {
      if (str[i] >= '0' && str[i] <= '9') {
        // eslint-disable-next-line no-extend-native
        String.prototype.replaceAt = function(index, replacement) {
          return this.substr(0, index) + replacement +
              this.substr(index + replacement.length);
        };
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
    return (
      <Container className={this.classes.meetingLink}>

        <Button variant="contained" color="primary"
          className={this.classes.button}
          startIcon = {<VideoCallRoundedIcon />}
          onClick={this.johnMeeting}
        >
          Start a meeting
        </Button>

      </Container>
    );
  }
}

export default withStyles(styles)(MeetingLink);
