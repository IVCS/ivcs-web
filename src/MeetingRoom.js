import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import withStyles from '@material-ui/styles/withStyles';

const styles = () => ({
  meetingRoom: {
    margin: 'auto',
    marginTop: '100px',
    backgroundColor: '#e2b0b0',
    width: '50%',
    height: '50%',
    minWidth: '400px',
  },
  joinNowButton: {
    display: 'block',
    margin: 'auto',
  },
  localVideo: {
    display: 'block',
    margin: 'auto',
    marginTop: '30px',
    borderStyle: 'solid',
    borderColor: '#4a4646',
    width: '80%',
    height: '40%',
  },
});

class MeetingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.localVideoRef = React.createRef();

    this.state = {
      video: false,
      audio: false,
    };
  }

  startLocalVideo = async () => {
    navigator.mediaDevices
        .getUserMedia({video: this.state.video})
        .then((stream) => this.localVideoRef.current.srcObject = stream)
        .catch((e) => console.log(e));
  }

  joinNow = () => this.setState({video: true}, () => this.startLocalVideo())

  render() {
    const {classes} = this.props;
    return (
      <Container className={classes.meetingRoom}>
        <Typography align="center" color="primary" variant="h2">
          test
        </Typography>
        <Button variant="outlined" color="primary" onClick={this.joinNow}
          className={classes.joinNowButton}>
          Join Now
        </Button>
        <video ref={this.localVideoRef} className={classes.localVideo} autoPlay>
        </video>
      </Container>
    );
  }
}

export default withStyles(styles)(MeetingRoom);
