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

    this.videoTrack = null;
    this.audioTrack = null;

    this.video = true;
    this.audio = true;

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
    this.video = true;
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

  stopStreamedAudio = () => {
    this.audioTrack.forEach((track) => {
      track.stop();
    });
  }

  dismiss = () => {
    this.stopStreamedVideo();
    this.setState({dismiss: true});
  }

  componentDidMount() {
    this.stream = this.props.stream;
    // this.videoBoxRef.current.srcObject = this.stream.getVideoTracks[0];

    const testStream = new MediaStream();

    testStream.addTrack(this.stream.getVideoTracks()[0]);

    this.videoBoxRef.current.srcObject = testStream;

    this.audioTrack = this.stream.getAudioTracks();
    this.videoTrack = this.stream.getVideoTracks();
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
