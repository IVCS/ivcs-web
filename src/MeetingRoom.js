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
        // 'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  // iceCandidatePoolSize: 10,
};

class MeetingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();

    this.roomId = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerConn = {};
    this.userList = null;
    this.userWhoSendMeOffer = [];

    this.localStream = null;

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
    this.userList.forEach((user) => {
      if (user === this.state.username) return;
      this.rtcPeerConn[user].onaddstream = (e) => {
        const videoArea = document.getElementById('video-area');
        const video = document.createElement('video');
        video.style.setProperty('display', 'block');
        video.style.setProperty('margin', 'auto');
        video.style.setProperty('margin-top', '30px');
        video.style.setProperty('borderStyle', 'solid');
        video.style.setProperty('width', '80%');
        video.style.setProperty('height', '40%');
        video.srcObject = e.stream;
        video.autoplay = true;
        videoArea.appendChild(video);
      };
    });
  }

  sendLocalDescription = (user, description) => {
    this.rtcPeerConn[user].setLocalDescription(description)
        .then(() => {
          this.socket.emit(
              'signal from client',
              JSON.stringify({
                'type': 'SDP',
                'message': this.rtcPeerConn[user].localDescription,
                'roomId': this.roomId,
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
        // console.log('signal.username: ', signal.username);
        // console.log('this.username: ', this.state.username);
        this.rtcPeerConn[signal.username]
            .setRemoteDescription(new RTCSessionDescription(signal.message))
            .then(() => {
              // TODO: Fix "Failed to set remote answer sdp"
              if (signal.message.type === 'offer') {
                this.userWhoSendMeOffer.push(signal.username);
                this.rtcPeerConn[signal.username].createAnswer()
                    .then((description) => {
                      this.sendLocalDescription(signal.username, description);
                    })
                    .catch((e) => console.log(e));
              }
            })
            .catch((e) => console.log(e));
      }

      if (signal.type === 'ICE') {
        console.log('Received ice from server', signal);
        this.rtcPeerConn[signal.username]
            .addIceCandidate(new RTCIceCandidate(signal.message))
            .catch((e) => console.log(e));
      }
    }
  }

  sendSignalToServer = () => {
    this.updateSignalLog('starting signaling...');

    this.userList.forEach((user) => {
      if (user === this.state.username) return;
      if (this.rtcPeerConn[user] !== undefined) return;

      console.log('real users: ', user);

      // Setup the RTC Peer Connection object
      this.rtcPeerConn[user] = new RTCPeerConnection(RTCIceServerConfig);

      // send any ice candidates to the other peer
      this.rtcPeerConn[user].onicecandidate = (e) => {
        if (e.candidate) {
          this.socket.emit(
              'signal from client',
              JSON.stringify({
                'type': 'ICE',
                'message': e.candidate,
                'roomId': this.roomId,
                'username': this.state.username,
              }),
          );
        }
        this.updateSignalLog('completed that ice candidate...');
      };

      // let the 'negotiationneeded' event trigger offer generation
      if (this.userWhoSendMeOffer.includes(user)) return;

      this.rtcPeerConn[user].onnegotiationneeded = () => {
        this.updateSignalLog('on negotiation called');
        this.updateSignalLog('sending SDP offer');
        this.rtcPeerConn[user].createOffer()
            .then((description) => {
              this.sendLocalDescription(user, description);
            })
            .catch((e) => console.log(e));
      };
    });
  }

  connectServer = () => {
    this.socket = io(signalingServerUrl);

    this.socket.emit('join room', this.roomId, this.state.username);

    this.socket.on('user joined', (currentUser, userList) => {
      this.updateSignalLog(`${currentUser} has joined the ${this.roomId} room`);
      console.log('get user joined msg');
      console.log(userList);
      this.userList = userList;
      this.sendSignalToServer();
      this.getRemoteMedia().catch((e) => console.log(e));
      // TODO: Change addStream to addTrack
      this.userList.forEach((user) => {
        if (user === this.state.username) return;
        this.rtcPeerConn[user].addStream(this.localStream);
      });
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
          this.localVideoRef.current.srcObject = stream;
          this.localStream = stream;
        })
        .catch((e) => console.log(e));
  }

  // TODO: Implement multi-user video conference function
  joinRoom = () => this.setState({video: true}, () => {
    this.getLocalMedia()
        .then(() => this.connectServer())
        .catch((e) => console.log(e));
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
            onChange={(e) => this.changeUsername(e)}
            placeholder="username"
            value={this.state.username}
          />
          <Button variant="outlined" color="primary" onClick={this.joinRoom}
            className={classes.joinNowButton}>
              Join Now
          </Button>
        </Container>

        <video ref={this.localVideoRef} className={classes.video} autoPlay>
        </video>

        <div id="video-area">
        </div>

        <Typography variant="h6" id="signal-log">
            signal log:
        </Typography>
      </Container>
    );
  }
}

export default withStyles(styles)(MeetingRoom);
