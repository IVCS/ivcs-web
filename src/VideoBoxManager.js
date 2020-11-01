import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import VideoBox from './VideoBox';

const styles = () => ({
  videoBoxManager: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
});

class VideoBoxManager extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.localUserId = null;

    this.videoBoxRefs = {};

    this.videoBoxes = [];

    this.state = {
      newVideoBox: false,
    };
  }

  removeVideoBox = (userId) => {
    this.videoBoxRefs[userId].current.dismiss();
  }

  newVideoBox = (userId, videoTrack) => {
    this.videoBoxRefs[userId] = React.createRef();

    this.videoBoxes.push(<VideoBox
      ref={this.videoBoxRefs[userId]}
      userId={userId}
      videoTrack={videoTrack}
    />);

    this.setState({newVideoBox: true});
  }

  render() {
    return (
      <Container className={this.classes.videoBoxManager}>
        {
            this.state.newVideoBox ? this.videoBoxes : null
        }
      </Container>
    );
  }
}

VideoBoxManager.propTypes = {
  newVideoBox: PropTypes.func,
  removeVideoBox: PropTypes.func,
};

export default withStyles(styles)(VideoBoxManager);
