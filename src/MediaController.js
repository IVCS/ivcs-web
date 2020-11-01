import React, {Component} from 'react';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
// import VideoBoxManager from './VideoBoxManager';
import {IconButton} from '@material-ui/core';
// import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
// import MeetingRoom from './MeetingRoom';

export default class MediaController extends Component {
  constructor(props) {
    super(props);
    this.state ={
      video: this.props.state,
      audio: this.props.state,
    };

    this.handleVideo = this.handleVideo.bind(this);
  }


    handleVideo = () => this.setState({video: !this.props.video},
        () => {
          console.log('This State in handle:', this.state.video);
          const {video} = this.state;
          console.log('Props State Before in handle: ', this.props.video);
          console.log('MC this state after changed in handle: ', video);
          const current = {video};
          this.props.updateState(current);
          // .then(()=>this.props.stopVideoOnly())
          this.props.getLocalMedia(current);
          // .catch((e) => console.log(e));
        })

    handleAudio = () => this.setState({audio: !this.state.audio},
        () => this.props.getLocalMedia())

    handleCall = () =>{
      try {
        const tracks = this.localStream.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
      window.location.href = '/';
    }

    render() {
      return (
        <div className="btn-menu" style={{backgroundColor: 'whitesmoke',
          color: 'whitesmoke', textAlign: 'center'}}>
          <IconButton style={{color: '#424242'}} onClick={this.handleVideo}>
            {(this.state.video === true)?<VideocamIcon/>:<VideocamOffIcon/>}
          </IconButton>
          <IconButton style={{color: '#f44336'}}>
            <CallEndIcon />
          </IconButton>
          <IconButton style={{color: '#424242'}} onClick={this.handleAudio}>
            {(this.state.audio === true)?<MicIcon/>:<MicOffIcon/>}
          </IconButton>
        </div>
      );
    }
}

MediaController.propTypes = {
  getLocalMedia: PropTypes.func.isRequired,
  // stopVideoOnly: PropTypes.func.isRequired,
  updateState: PropTypes.func.isRequired,
};
