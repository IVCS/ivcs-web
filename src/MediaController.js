import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Container from '@material-ui/core/Container';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import IconButton from '@material-ui/core/IconButton';

const styles = () => ({
  mediaController: {
    background: 'whitesmoke',
    textAlign: 'center',
  },
});

class MediaController extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state ={
      localVideo: true,
      localAudio: true,
    };
  }

  handleVideo = () => {
    const reversedState = !this.state.localVideo;
    this.setState({localVideo: reversedState});
    this.props.onHandleVideo(reversedState);
  }

  handleAudio = () => {
    const reversedState = !this.state.localAudio;
    this.setState({localAudio: reversedState});
    this.props.onHandleAudio(reversedState);
  }

  render() {
    return (
      <Container className={this.classes.mediaController}>

        <IconButton onClick={this.handleVideo}>
          {
            !this.state.localVideo ? <VideocamIcon/> : <VideocamOffIcon/>
          }
        </IconButton>

        <IconButton>
          <CallEndIcon onClick={this.props.onCallEnd}/>
        </IconButton>

        <IconButton onClick={this.handleAudio}>
          {
            !this.state.localAudio ? <MicIcon/> : <MicOffIcon/>
          }
        </IconButton>

      </Container>
    );
  }
}

export default withStyles(styles)(MediaController);
