import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import {Container} from '@material-ui/core';

const styles = () => ({
  videoBoxManager: {
    width: '100%',
    height: '100%',
  },
  videoBox: {
    display: 'block',
    margin: 'auto',
    marginTop: '30px',
    borderStyle: 'solid',
    borderColor: '#6fd2a0',
    width: '80%',
    height: '40%',
  },
});

class VideoBoxManager extends React.Component {
  constructor(props) {
    super(props);

    this.videoBoxManager = React.createRef();

    this.videoRefs = {};

    this.classes = this.props.classes;
  }

  updateMediaStream = (userId, mediaStream) => {
    console.log('userid, media stream:', userId, mediaStream);
    this.videoRefs[userId] = React.createRef();
    const video = document.createElement('video');
    video.className = this.classes.videoBox;
    video.ref = this.videoRefs[userId];
    video.autoplay = true;
    video.srcObject = mediaStream;
    this.videoBoxManager.current.appendChild(video);
  }

  render() {
    return (
      <Container
        className={this.classes.videoBoxManager}
        ref={this.videoBoxManager}
      />
    );
  }
}

VideoBoxManager.propTypes = {
  updateMediaStream: PropTypes.func,
};

export default withStyles(styles)(VideoBoxManager);
