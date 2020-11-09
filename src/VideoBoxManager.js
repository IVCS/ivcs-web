import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import VideoBox from './VideoBox';

const boxContainerStyles = () => ({
  videoBoxManager: {
    display: 'flex',
    position: 'relative',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    padding: 0,
    margin: '0 auto',
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
    console.log('user id in add video box', userId);
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
      <Container disableGutters = {true}
        className={this.classes.videoBoxManager}>
        {
            this.state.addVideoBox ? this.videoBoxes : null
        }
      </Container>
    );
  }
}

VideoBoxManager.propTypes = {
  addVideoBox: PropTypes.func,
  removeVideoBox: PropTypes.func,
};

export default withStyles(boxContainerStyles)(VideoBoxManager);
