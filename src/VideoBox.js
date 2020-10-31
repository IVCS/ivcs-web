import React from 'react';
import withStyles from '@material-ui/styles/withStyles';

const styles = () => ({
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

class VideoBox extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.videoBoxRef = React.createRef();
  }

  componentDidMount() {
    this.videoBoxRef.current.srcObject = this.props.videoTrack;
  }

  render() {
    return (
      <video
        className={this.classes.videoBox}
        id={this.props.userId}
        ref={this.videoBoxRef}
        autoPlay
      >
      </video>
    );
  }
}

export default withStyles(styles)(VideoBox);
