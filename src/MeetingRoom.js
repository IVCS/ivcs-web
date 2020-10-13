import React from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import VideoBoxManager from './VideoBoxManager';
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

    this.localStream = null;
    this.videoBoxManagerRef = React.createRef();

    this.roomId = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerConn = {};
    this.userList = [];
    this.userId = null;

    this.state = {
      video: false,
      audio: false,
      username: faker.internet.userName(),
    };
  }

  changeUsername = (e) => this.setState({username: e.target.value});

  getRemoteMedia = async () => {
    // once remote stream arrives, show it in the remote video element
    this.userList.forEach((user) => {
      const userId = user.userId;
      if (userId === this.userId) return;
      this.rtcPeerConn[userId].onaddstream = (event) => {
        this.videoBoxManagerRef.current.updateMediaStream(userId, event.stream);
      };
    });
  }

  sendLocalDescription = (userId, description) => {
    this.rtcPeerConn[userId].setLocalDescription(description)
        .then(() => {
          this.socket.emit(
              'signal from client',
              JSON.stringify({
                'type': 'SDP',
                'message': this.rtcPeerConn[userId].localDescription,
                'srcUserId': this.userId,
                'destUserId': userId,
                'username': this.state.username,
              }),
          );
        })
        .catch((e) => console.log(e));
  }

  receiveSignalFromServer = (data) => {
    const signal = JSON.parse(data);

    if (signal.type === 'SDP') {
      if (signal.message) {
        this.rtcPeerConn[signal.srcUserId]
            .setRemoteDescription(new RTCSessionDescription(signal.message))
            .then(() => {
              if (signal.message.type === 'offer') {
                this.rtcPeerConn[signal.srcUserId].createAnswer()
                    .then((description) => {
                      this.sendLocalDescription(signal.srcUserId, description);
                    })
                    .catch((e) => console.log(e));
              }
            })
            .catch((e) => console.log(e));
      }
    }

    if (signal.type === 'ICE') {
      console.log('received ice from user: ', signal.srcUserId);
      this.rtcPeerConn[signal.srcUserId]
          .addIceCandidate(new RTCIceCandidate(signal.message))
          .catch((e) => console.log(
              'Error adding received ice candidate', e),
          );
    }
  }

  sendSignalToServer = () => {
    this.userList.forEach((user) => {
      const userId = user.userId;
      const lastUserId = this.userList[this.userList.length-1].userId;

      if (userId === this.userId) return;
      if (this.rtcPeerConn[userId] !== undefined) return;

      // Setup the RTC Peer Connection object
      this.rtcPeerConn[userId] = new RTCPeerConnection(RTCIceServerConfig);

      // Send any ice candidates to the other peer
      this.rtcPeerConn[userId].onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit(
              'signal from client',
              JSON.stringify({
                'type': 'ICE',
                'message': event.candidate,
                'srcUserId': this.userId,
                'destUserId': userId,
                'username': this.state.username,
              }),
          );
        }
      };

      // Send sdp offer
      if (lastUserId !== this.userId) return;
      this.rtcPeerConn[userId].onnegotiationneeded = () => {
        this.rtcPeerConn[userId].createOffer()
            .then((description) => {
              this.sendLocalDescription(userId, description);
            })
            .catch((e) => console.log(e));
      };
    });
  }

  connectServer = () => {
    this.socket = io(signalingServerUrl);

    this.socket.on('connect', () => {
      this.userId = this.socket.id;

      this.videoBoxManagerRef.current
          .updateMediaStream(this.userId, this.localStream);

      this.socket.emit('join room',
          this.roomId, this.userId, this.state.username);

      this.socket.on('signal from server', (data) => {
        this.receiveSignalFromServer(data);
      });

      this.socket.on('user joined',
          (joinedUserId, joinedUserName, userList) => {
            this.userList = userList;

            this.sendSignalToServer();

            this.getRemoteMedia().catch((e) => console.log(e));

            // TODO: Change addStream to addTrack
            this.userList.forEach((user) => {
              const userId = user.userId;
              if (userId === this.userId) return;
              this.rtcPeerConn[userId].addStream(this.localStream);
              // for (const track of this.localStream.getTracks()) {
              //   this.rtcPeerConn[userId].addTrack(track, this.localStream);
              // }
            });
          });
    });
  }

  getLocalMedia = async () => {
    // get a local stream, show it in our video tag and add it to be sent
    await navigator.mediaDevices
        .getUserMedia({video: this.state.video})
        .then((stream) => {
          this.localStream = stream;
        })
        .catch((e) => console.log(e));
  }

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
            IVCS
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

        <VideoBoxManager ref={this.videoBoxManagerRef} />

      </Container>
    );
  }
}

export default withStyles(styles)(MeetingRoom);
