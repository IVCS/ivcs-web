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

// <IconButton style={{color: '#424242'}} onClick={this.handleVideo}>
//   {(this.state.video === true)?<VideocamIcon/>:<VideocamOffIcon/>}
// </IconButton>
// <IconButton style={{color: '#f44336'}}>
//   <CallEndIcon />
// </IconButton>
// <IconButton style={{color: '#424242'}} onClick={this.handleAudio}>
//   {(this.state.audio === true)?<MicIcon/>:<MicOffIcon/>}
// </IconButton>
});

class MediaController extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state ={
      video: false,
      audio: false,
    };
  }

  handleVideo = () => {
    const reversedState = !this.state.video;
    this.setState({video: reversedState});
    this.props.onHandleVideo(reversedState);
  }

  render() {
    return (
      <Container className={this.classes.mediaController}>

        <IconButton onClick={this.handleVideo}>
          {
            this.state.video ? <VideocamIcon/> : <VideocamOffIcon/>
          }
        </IconButton>

        <IconButton>
          <CallEndIcon onClick={this.props.onCallEnd}/>
        </IconButton>

        <IconButton>
          {
            this.state.audio ? <MicIcon/> : <MicOffIcon/>
          }
        </IconButton>

      </Container>
    );
  }
}

export default withStyles(styles)(MediaController);
