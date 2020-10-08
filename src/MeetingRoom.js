import React from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import faker from 'faker';
import withStyles from '@material-ui/styles/withStyles';
import io from 'socket.io-client';

const styles = () => ({
  meetingRoom: {
    margin: 'auto',
    marginTop: '100px',
    backgroundColor: '#e2b0b0',
    width: '50%',
    height: '50%',
    minWidth: '400px',
  },
  joinNowContainer: {
    margin: '30px',
  },
  joinNowButton: {
    // display: 'block',
    margin: 'auto',
  },
  video: {
    display: 'block',
    margin: 'auto',
    marginTop: '30px',
    borderStyle: 'solid',
    borderColor: '#4a4646',
    width: '80%',
    height: '40%',
  },
});

const signalingServerUrl = 'http://127.0.0.1:3001';

const RTCIceServerConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

class MeetingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();

    this.roomName = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerCoon = null;

    this.state = {
      video: false,
      audio: false,
      username: faker.internet.userName(),
    };
  }

  updateSignalLog = (message) => {
    document.getElementById('signal-log').innerHTML =
        document.getElementById('signal-log').innerHTML +
        '<br>' + message;
  }

  changeUsername = (e) => this.setState({username: e.target.value});

  getRemoteMedia = async () => {
    // once remote stream arrives, show it in the remote video element
    this.rtcPeerConn.ontrack = (e) => {
      console.log('this remote video should be work');
      this.updateSignalLog('going to add remote stream...');
      this.remoteVideoRef.srcObject = e.stream[0];
    };
  }

  sendLocalDesc = (description) => {
    this.rtcPeerConn.setLocalDescription(description)
        .then(() => {
          this.socket.emit(
              'signal from client',
              JSON.stringify({
                'type': 'SDP',
                'message': this.rtcPeerConn.localDescription,
                'roomName': this.roomName,
                'username': this.state.username,
              }),
          );
        })
        .catch((e) => console.log(e));
  }

  receiveSignalFromServer = (data) => {
    const signal = JSON.parse(data);

    this.updateSignalLog(`Signal received: ${signal.type}`);

    if (signal.username !== this.state.username) {
      if (signal.type === 'SDP') {
        this.updateSignalLog('<br>Logging SDP<br>');
        console.log('signal.username: ', signal.username);
        console.log('this.username: ', this.state.username);
        this.rtcPeerConn
            .setRemoteDescription(new RTCSessionDescription(signal.message))
            .then(() => {
              if (signal.message.type === 'offer') {
                this.rtcPeerConn.createAnswer()
                    .then((description) => {
                      this.sendLocalDesc(description);
                      this.updateSignalLog('<br>sending sdp answer<br>');
                    })
                    .catch((e) => console.log(e));
              }
              this.getRemoteMedia()
                  .catch((e)=>console.log(e));
            })
            .catch((e) => console.log(e));
      }

      // TODO Fix "Error processing ICE candidate"
      if (signal.type === 'ICE') {
        console.log(signal);
        this.rtcPeerConn
            .addIceCandidate(new RTCIceCandidate(signal.message))
            .catch((e) => console.log(e));
      }
    }
  }

  sendSignalToServer = () => {
    this.updateSignalLog('starting signaling...');

    // Setup the RTC Peer Connection object
    this.rtcPeerConn = new RTCPeerConnection(RTCIceServerConfig);

    // send any ice candidates to the other peer
    this.rtcPeerConn.onicecandidate = (e) => {
      if (e.candidate) {
        this.socket.emit(
            'signal from client',
            JSON.stringify({
              'type': 'ICE',
              'message': e.candidate,
              'roomName': this.roomName,
              'username': this.state.username,
            }),
        );
      }
      this.updateSignalLog('completed that ice candidate...');
    };

    // let the 'negotiationneeded' event trigger offer generation
    this.rtcPeerConn.onnegotiationneeded = () => {
      this.updateSignalLog('on negotiation called');
      this.updateSignalLog('sending SDP offer');
      this.rtcPeerConn.createOffer()
          .then((description) => {
            this.sendLocalDesc(description);
          })
          .catch((e)=>console.log(e));
    };
  }

  connectServer = () => {
    this.socket = io(signalingServerUrl);

    this.socket.emit('join room', this.roomName, this.state.username);

    this.socket.on('user joined', (msg) => {
      this.updateSignalLog(msg);
    });

    this.socket.on('signal from server', (data) => {
      this.receiveSignalFromServer(data);
    });
  }

  getLocalMedia = async () => {
    // get a local stream, show it in our video tag and add it to be sent
    await navigator.mediaDevices
        .getUserMedia({video: this.state.video})
        .then((stream) => {
          this.sendSignalToServer();
          this.localVideoRef.current.srcObject = stream;
          for (const track of stream.getTracks()) {
            this.rtcPeerConn.addTrack(track);
          }
        })
        .catch((e) => console.log(e));
  }

  joinRoom = () => this.setState({video: true}, () =>{
    this.getLocalMedia()
        .then(() => this.connectServer())
        .catch((e)=>console.log(e));
  });

  render() {
    const {classes} = this.props;
    return (
      <Container className={classes.meetingRoom}>
        <Typography align="center" color="primary" variant="h2">
          test
        </Typography>

        <Container className={classes.joinNowContainer}>
          <Input
            onChange={(e)=>this.changeUsername(e)}
            placeholder="username"
            value={this.state.username}
          />
          <Button variant="outlined" color="primary" onClick={this.joinRoom}
            className={classes.joinNowButton}>
          Join Now
          </Button>
        </Container>

        <Typography variant="h6" id="log">
          log:
        </Typography>

        <video ref={this.localVideoRef} className={classes.video} autoPlay>
        </video>
        <video ref={this.remoteVideoRef} className={classes.video} autoPlay>
        </video>

        <Typography variant="h6" id="signal-log">
          signal log:
        </Typography>
      </Container>
    );
  }
}

export default withStyles(styles)(MeetingRoom);
