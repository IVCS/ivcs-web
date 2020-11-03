import React from 'react';
import withStyles from '@material-ui/styles/withStyles';

const styles = () => ({
  videoBox: {
    background: 'tomato',
    padding: '5px',
    width: '200px',
    height: '150px',
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

    this.stream = null;

    this.tracks = null;

    this.state = {
      dismiss: false,
    };
  }

  blackCanvas = ({width = 200, height = 150} = {}) => {
    const canvas = Object.assign(document.createElement('canvas'),
        {width, height});
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const captureStream = canvas.captureStream();
    return Object.assign(captureStream.getVideoTracks()[0], {enabled: false});
  }

  attachNewStream = (stream) => {
    this.videoBoxRef.current.srcObject = stream;
  }

  stopStreamedVideo = () => {
    this.videoBoxRef.current.srcObject = new MediaStream([this.blackCanvas()]);
    // this.tracks.forEach((track) => {
    //   track.stop();
    //   track.enabled = false;
    //   const blackCanvasStream = new MediaStream(this.blackCanvas());
    //   this.videoBoxRef.current.srcObject = blackCanvasStream;
    //   // track.dispatchEvent(new Event('ended'));
    // });
  }

  dismiss = () => {
    this.stopStreamedVideo();
    this.setState({dismiss: true});
  }

  componentDidMount() {
    this.stream = this.props.stream;
    this.videoBoxRef.current.srcObject = this.stream;
    this.tracks = this.videoBoxRef.current.srcObject.getTracks();

    // console.log('this tracks in video box', this.tracks);
    // this.tracks.forEach((track) => {
    //   console.log('foreach tracks in video box', track);
    //   track.onended = () => {
    //     console.log('onended triggered');
    //     track.stop();
    //   };
    // });
  }

  render() {
    return (
      this.state.dismiss ? null :
          <video
            className={this.classes.videoBox}
            ref={this.videoBoxRef}
            autoPlay>
          </video>
    );
  }
}

export default withStyles(styles)(VideoBox);
