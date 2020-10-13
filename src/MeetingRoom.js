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

    this.roomId = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerConn = {};
    this.userList = [];
    this.userId = null;
    this.userWhoGotOffer = [];

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
      const userId = user.userId;
      if (userId === this.userId) return;
      this.rtcPeerConn[userId].onaddstream = (e) => {
        // console.log('get remote video from: ', user);
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

    this.updateSignalLog(`Signal received: ${signal.type}`);

    console.log('Got signal from server', signal);
    console.log('from user: ', signal.username);

    if (signal.type === 'SDP') {
      this.updateSignalLog('<br>Logging SDP<br>');

      if (signal.message) {
        if (signal.message.type === 'answer') {
          console.log('Got sdp answer from user: ', signal.srcUserId);
          console.log('Sdp answer content: ', signal);
        }
        this.rtcPeerConn[signal.srcUserId]
            .setRemoteDescription(new RTCSessionDescription(signal.message))
            .then(() => {
              console.log('set remote description success');
              console.log('RTC peer connection list: ', this.rtcPeerConn);
              if (signal.message.type === 'offer') {
                console.log('Got sdp offer from user: ', signal.srcUserId);
                console.log('Sdp offer content: ', signal);
                this.rtcPeerConn[signal.srcUserId].createAnswer()
                    .then((description) => {
                      this.sendLocalDescription(signal.srcUserId, description);
                      console
                          .log('Sent sdp answer to user: ', signal.srcUserId);
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
    this.updateSignalLog('starting signaling...');

    this.userList.forEach((user) => {
      const userId = user.userId;
      const username = user.username;
      const lastUserId = this.userList[this.userList.length-1].userId;

      if (userId === this.userId) return;
      if (this.rtcPeerConn[userId] !== undefined) return;

      // Setup the RTC Peer Connection object
      this.rtcPeerConn[userId] = new RTCPeerConnection(RTCIceServerConfig);
      console.log('RTC peer connection at start: ', this.rtcPeerConn);
      console.log('user name in send signal function: ', username);

      // Send any ice candidates to the other peer
      console.log('traverse user in send signal function: ', userId, username);
      this.rtcPeerConn[userId].onicecandidate = (event) => {
        console.log('event candidate: ', event.candidate);
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
        console.log('send ice to user: ', userId);
        this.updateSignalLog('completed that ice candidate...');
      };

      // Send sdp offer
      if (lastUserId !== this.userId) return;
      if (this.userWhoGotOffer.includes(userId)) return;
      this.updateSignalLog(`send SDP offer to user ${username}`);

      this.rtcPeerConn[userId].onnegotiationneeded = () => {
        this.updateSignalLog('on negotiation called');
        this.updateSignalLog('sending SDP offer');
        this.rtcPeerConn[userId].createOffer()
            .then((description) => {
              this.sendLocalDescription(userId, description);
              console.log('sent sdp offer to user: ', username);
              this.userWhoGotOffer.push(userId);
            })
            .catch((e) => console.log(e));
      };
    });
  }

  connectServer = () => {
    this.socket = io(signalingServerUrl);

    this.socket.on('connect', () => {
      this.userId = this.socket.id;

      this.socket.emit('join room',
          this.roomId, this.userId, this.state.username);

      this.socket.on('signal from server', (data) => {
        this.receiveSignalFromServer(data);
      });

      this.socket.on('user joined',
          (joinedUserId, joinedUserName, userList) => {
            this.updateSignalLog(
                `${joinedUserName} has joined the ${this.roomId} room`);

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
          this.localVideoRef.current.srcObject = stream;
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
