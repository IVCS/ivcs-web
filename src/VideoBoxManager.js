import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import {Container} from '@material-ui/core';

const styles = () => ({
  videoBoxManager: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  videoBox: {
    background: 'tomato',
    padding: '5px',
    width: '200px',
    height: '150',
    marginTop: '10px',
    lineHeight: '150px',
    textAlign: 'center',
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
    // console.log('userid, media stream:', userId, mediaStream);
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
