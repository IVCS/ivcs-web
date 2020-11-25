import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Container from '@material-ui/core/Container';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import Badge from '@material-ui/core/Badge';

const styles = () => ({
  mediaController: {
    position: 'absolute',
    bottom: 0,
    margin: 0,
    boxShadow: '0 0 10px 10px rgba(255, 255, 255, .6)',
    background: '#ffffff',
    borderWidth: 'thin',
    borderColor: '#ffffff',
    borderStyle: 'outset',
    borderRadius: '10px',
    opacityStyle: 1,
    whiteSpace: 'nowrap',
    height: '80px',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  controlButton: {
    position: 'relative',
    margin: '15px',
    height: '45px',
  },
});

class MediaController extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state ={
      localVideo: true,
      localAudio: true,
      showChatRoom: false,
      numberOfNewMessages: 0,
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

  updateNumberOfNewMessages = (reset) => {
    if (reset === true) {
      this.setState({
        numberOfNewMessages: 0,
      });
    } else {
      this.setState({
        numberOfNewMessages: this.state.numberOfNewMessages + 1,
      });
    }
  }

  openChatRoom = () => {
    this.setState({showChatRoom: true});
    this.updateNumberOfNewMessages(true);
    this.props.onOpenChatRoom(true);
  }

  closeChatRoom = () => {
    this.setState({showChatRoom: false});
    this.updateNumberOfNewMessages(true);
  }

  render() {
    return (
      <Container disableGutters="true" align="center"
        className={this.classes.mediaController} >

        <IconButton onClick={this.handleVideo}
          className={this.classes.controlButton}>
          {
            this.state.localVideo ? <VideocamIcon/> : <VideocamOffIcon/>
          }
        </IconButton>

        <IconButton className={this.classes.controlButton}>
          <CallEndIcon onClick={this.props.onCallEnd}/>
        </IconButton>

        <IconButton onClick={this.handleAudio}
          className={this.classes.controlButton}>
          {
            this.state.localAudio ? <MicIcon/> : <MicOffIcon/>
          }
        </IconButton>

        {
          !this.state.showChatRoom ?
              <Badge badgeContent={this.state.numberOfNewMessages} max={999}
                color="secondary" onClick={this.openChatRoom}
              >
                <IconButton onClick={this.openChatRoom}
                  className={this.classes.controlButton}
                >
                  <ChatIcon />
                </IconButton>
              </Badge> : null
        }

      </Container>
    );
  }
}

export default withStyles(styles)(MediaController);
