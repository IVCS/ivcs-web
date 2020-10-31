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

    this.videoBoxRefs = {};

    this.videoBoxes = [];

    this.state = {
      newVideoBox: false,
    };
  }

  newVideoBox = (userId, videoTrack) =>{
    this.videoBoxes[userId] = React.createRef();

    this.videoBoxes.push(<VideoBox
      ref={this.videoBoxes[userId]}
      userId={userId}
      videoTrack={videoTrack}
    />);

    this.setState({newVideoBox: true});

    console.log('check this.videobox', this.videoBoxes);
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
};

export default withStyles(styles)(VideoBoxManager);
