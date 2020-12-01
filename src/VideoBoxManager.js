import React from 'react';
import Box from '@material-ui/core/Box';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import VideoBox from './VideoBox';

const styles = () => ({
  videoBoxManager: {
    display: 'flex',
    position: 'relative',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    padding: 0,
    margin: '100px auto',
    height: '79.5%',
    listStyle: 'none',
    textAlign: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    overflow: 'auto',
  },
});

class VideoBoxManager extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.videoBoxRefs = {};

    this.videoBoxes = [];

    this.state = {
      addVideoBox: false,
    };
  }

  stopStreamedVideo = (userId) => {
    this.videoBoxRefs[userId].current.removeVideoTrack();
  }

  stopStreamedAudio = (userId) => {
    this.videoBoxRefs[userId].current.removeAudioTrack();
  }

  removeVideoBox = (userId) => {
    this.videoBoxRefs[userId].current.dismiss();
  }

  addVideoBox = (userId) => {
    if (this.videoBoxRefs[userId]) return;

    this.videoBoxRefs[userId] = React.createRef();

    this.videoBoxes.push(<VideoBox
      ref={this.videoBoxRefs[userId]}
      userId={userId}
    />);

    this.setState({addVideoBox: true});
  }

  handleTrack = (userId, track) => {
    if (!this.videoBoxRefs[userId]) {
      this.addVideoBox(userId);
    }
    this.videoBoxRefs[userId].current.addTrack(track);
  }

  render() {
    return (
      <Box className={this.classes.videoBoxManager}>
        {
          this.state.addVideoBox ? this.videoBoxes : null
        }
      </Box>
    );
  }
}

VideoBoxManager.propTypes = {
  addVideoBox: PropTypes.func,
  removeVideoBox: PropTypes.func,
};

export default withStyles(styles)(VideoBoxManager);
