import React from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import VideoBoxManager from './VideoBoxManager';
import faker from 'faker';
import withStyles from '@material-ui/styles/withStyles';
import io from 'socket.io-client';
import MediaController from './MediaController';

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
    this.localVideoTrack = null;
    this.localAudioTrack = null;
    this.videoBoxManagerRef = React.createRef();

    this.roomId = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerConn = {};
    this.sender = [];
    this.userList = [];
    this.userId = null;

    this.state = {
      video: false,
      audio: false,
      callEnd: false,
      username: faker.internet.userName(),
    };
  }

  changeUsername = (e) => this.setState({username: e.target.value});

  getRemoteMedia = async () => {
    // once remote stream arrives, show it in the remote video element
    this.userList.forEach((user) => {
      const userId = user.userId;
      if (userId === this.userId) return;
      this.rtcPeerConn[userId].ontrack = (event) => {
        this.videoBoxManagerRef.current.handleTrack(userId, event.track);

        // event.stream.onremovetrack = () => {
        //   if (event.stream.getAudioTracks().length === 0) {
        //     this.videoBoxManagerRef.current.stopStreamedAudio(userId);
        //   } else {
        //     this.videoBoxManagerRef.current.stopStreamedVideo(userId);
        //   }
        //
        //   this.videoBoxManagerRef.current.stopStreamedVideo(userId);
        // };
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
      const lastUserId = this.userList[this.userList.length - 1].userId;

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

      this.socket.emit('join room',
          this.roomId, this.userId, this.state.username);

      this.socket.on('signal from server', (data) => {
        this.receiveSignalFromServer(data);
      });

      this.socket.on('user left', (userId) => {
        this.videoBoxManagerRef.current.removeVideoBox(userId);
      });

      this.socket.on('user joined',
          (joinedUserId, joinedUserName, userList) => {
            this.userList = userList;

            this.sendSignalToServer();

            this.getRemoteMedia().catch((e) => console.log(e));

            const lastUserId = this.userList[this.userList.length - 1].userId;
            // Add stream to all connection
            if (lastUserId === this.userId) {
              this.userList.forEach((user) => {
                const userId = user.userId;
                if (userId === this.userId) return;

                this.sender[userId] = {};
                this.sender[userId]['audioTrack'] = this.rtcPeerConn[userId]
                    .addTrack(this.localAudioTrack, this.localStream);
                this.sender[userId]['videoTrack'] = this.rtcPeerConn[userId]
                    .addTrack(this.localVideoTrack, this.localStream);
              });
            } else {
            // Only add stream to the connection of the last newest user
              this.sender[lastUserId] = {};
              this.sender[lastUserId]['audioTrack'] =
                this.rtcPeerConn[lastUserId]
                    .addTrack(this.localAudioTrack, this.localStream);
              this.sender[lastUserId]['videoTrack'] =
                  this.rtcPeerConn[lastUserId]
                      .addTrack(this.localVideoTrack, this.localStream);
            }
          });
    });
  }

  getLocalMedia = async () => {
    // Get a local stream, show it in our video tag and add it to be sent
    await navigator.mediaDevices
        .getUserMedia({video: true, audio: true})
        .then((stream) => {
          this.localStream = stream;
          this.localVideoTrack = stream.getVideoTracks()[0];
          this.localAudioTrack = stream.getAudioTracks()[0];
          this.videoBoxManagerRef.current
              .handleTrack(this.userId, this.localVideoTrack);
          this.videoBoxManagerRef.current
              .handleTrack(this.userId, this.localAudioTrack);
        })
        .catch((e) => console.log(e));
  }

  joinRoom = () => this.setState({video: true}, () => {
    this.getLocalMedia()
        .then(() => this.connectServer())
        .catch((e) => console.log(e));
  });

  onHandleVideo = (localVideoState) => {
    // Turn on camera
    if (localVideoState === true) {
      this.getLocalMedia()
          .then(() => {
            this.videoBoxManagerRef.current
                .addVideoBox(this.userId, this.localStream);
            this.userList.forEach((user) => {
              const userId = user.userId;
              if (userId === this.userId) return;
              this.sender[userId]['videoTrack'] = this.rtcPeerConn[userId]
                  .addTrack(this.localVideoTrack, this.localStream);
            });
          })
          .catch((e) => console.log(e));
    }

    // Turn off camera
    if (localVideoState === false) {
      this.videoBoxManagerRef.current.stopStreamedVideo(this.userId);
      this.userList.forEach((user) => {
        const userId = user.userId;
        if (userId === this.userId) return;
        this.rtcPeerConn[userId].removeTrack(this.sender[userId]['videoTrack']);
      });
    }

    // Resend sdp after switching camera
    this.userList.forEach((user) => {
      const userId = user.userId;
      if (userId === this.userId) return;
      // Send sdp offer
      this.rtcPeerConn[userId].onnegotiationneeded = () => {
        this.rtcPeerConn[userId].createOffer()
            .then((description) => {
              this.sendLocalDescription(userId, description);
            })
            .catch((e) => console.log(e));
      };
    });
  }

  onHandleAudio = (localAudioState) => {
    // Turn on microphone
    if (localAudioState === true) {
      this.getLocalMedia()
          .then(() => {
            this.userList.forEach((user) => {
              const userId = user.userId;
              if (userId === this.userId) return;
              this.sender[userId]['audioTrack'] = this.rtcPeerConn[userId]
                  .addTrack(this.localAudioTrack, this.localStream);
            });
          })
          .catch((e) => console.log(e));
    }

    // Turn off microphone
    if (localAudioState === false) {
      this.videoBoxManagerRef.current.stopStreamedAudio(this.userId);
      this.userList.forEach((user) => {
        const userId = user.userId;
        if (userId === this.userId) return;

        console.log('before remove rtcConn', this.rtcPeerConn[userId]);
        console.log('before remove rtcConn', this.localStream.getAudioTracks());
        this.rtcPeerConn[userId].removeTrack(this.sender[userId]['audioTrack']);
        console.log('after remove rtcConn', this.rtcPeerConn[userId]);
      });
    }

    // Resend sdp after switching camera
    this.userList.forEach((user) => {
      const userId = user.userId;
      if (userId === this.userId) return;
      // Send sdp offer
      this.rtcPeerConn[userId].onnegotiationneeded = () => {
        this.rtcPeerConn[userId].createOffer()
            .then((description) => {
              this.sendLocalDescription(userId, description);
            })
            .catch((e) => console.log(e));
      };
    });
  }

  callEnd = () => {
    Object.keys(this.rtcPeerConn).forEach((k) => this.rtcPeerConn[k].close());
    window.location.href = '/';
  }

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

        <VideoBoxManager
          ref={this.videoBoxManagerRef}
        />

        <MediaController
          onHandleVideo={this.onHandleVideo}
          onHandleAudio={this.onHandleAudio}
          onCallEnd={this.callEnd}
        />

      </Container>
    );
  }
}

export default withStyles(styles)(MeetingRoom);
