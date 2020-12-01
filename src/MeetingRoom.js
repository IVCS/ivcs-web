import React from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import faker from 'faker';
import VideoBoxManager from './VideoBoxManager';
import withStyles from '@material-ui/styles/withStyles';
import io from 'socket.io-client';
import MediaController from './MediaController';
import NavigationBar from './NavigationBar';
import VoiceChatOutlinedIcon from '@material-ui/icons/VoiceChatOutlined';
import ChatRoom from './ChatRoom';
import PropTypes from 'prop-types';

const styles = () => ({
  mainRoom: {
    position: 'fixed',
    left: '0px',
    top: '0px',
    margin: 0,
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  meetingRoom: {
    position: 'relative',
    margin: 0,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '80%',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
  },
  joinNowContainer: {
    position: 'relative',
    background: '#FFFFFF',
    width: '35%',
    height: '30%',
  },
  title: {
    marginTop: '50px',
    marginBottom: '50px',
  },
  joinNowButton: {
    position: 'relative',
    margin: 'auto',
  },
  inputText: {
    position: 'relative',
    margin: '20px 10px',
  },
});

// const signalingServerUrl = 'https://eny.li/';
const signalingServerUrl = 'http://localhost:3001';

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

    this.classes = this.props.classes;

    this.localStream = null;
    this.localVideo = false;
    this.localAudio = false;
    this.localScreen = false;
    this.localVideoTrack = null;
    this.localAudioTrack = null;
    this.videoBoxManagerRef = React.createRef();
    this.chatRoomRef = React.createRef();
    this.navigationBarRef = React.createRef();
    this.mediaControllerRef = React.createRef();

    this.roomId = window.location.pathname.substr(1);
    this.socket = null;
    this.rtcPeerConn = {};
    this.sender = [];
    this.userList = [];
    this.userId = null;
    this.userProfilePictureUrl = null;

    this.state = {
      permissionDenied: false,
      joined: false,
      video: false,
      audio: false,
      callEnd: false,
      username: faker.internet.userName(),
    };
  }

  changeUsername = (e) => {
    const newUsername = e.target.value;
    this.setState({username: newUsername});
    this.chatRoomRef.current.changeUsername(newUsername);
  }

  getRemoteMedia = async () => {
    // Once remote stream arrives, show it in the remote video element
    this.userList.forEach((user) => {
      const userId = user.userId;
      if (userId === this.userId) return;
      this.videoBoxManagerRef.current.addVideoBox(userId);
      this.rtcPeerConn[userId].ontrack = (event) => {
        this.videoBoxManagerRef.current.handleTrack(userId, event.track);

        event.streams[0].onremovetrack = (event) => {
          if (event.track.kind === 'video') {
            this.videoBoxManagerRef.current.stopStreamedVideo(userId);
          }
          if (event.track.kind === 'audio') {
            this.videoBoxManagerRef.current.stopStreamedAudio(userId);
          }
        };
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
                      this.sendLocalDescription(signal.srcUserId,
                          description);
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

      this.videoBoxManagerRef.current
          .handleTrack(this.userId, this.localVideoTrack);

      this.socket.emit('join room',
          this.roomId, this.userId, this.state.username);

      this.socket.on('signal from server', (data) => {
        this.receiveSignalFromServer(data);
      });

      this.socket.on('text message', (username, message) => {
        this.mediaControllerRef.current.updateNumberOfNewMessages(false);
        this.chatRoomRef.current.addMessage(username, message);
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
              if (this.localAudioTrack) {
                this.sender[lastUserId]['audioTrack'] =
                            this.rtcPeerConn[lastUserId]
                                .addTrack(this.localAudioTrack,
                                    this.localStream);
              }
              if (this.localVideoTrack) {
                this.sender[lastUserId]['videoTrack'] =
                            this.rtcPeerConn[lastUserId]
                                .addTrack(this.localVideoTrack,
                                    this.localStream);
              }
            }
          });
    });
  }

  getDisplayMedia = async () => {
    await navigator.mediaDevices.getDisplayMedia({video: true})
        .then((stream) => {
          this.localVideoTrack = stream.getVideoTracks()[0];
          this.localVideoTrack.onended = () => {
            this.onHandleVideo(false);
            this.mediaControllerRef.current.changeToStopScreenShareIcon();
          };
        })
        .catch((e) => console.log(e));
  }

  getLocalMedia = async () => {
    // Get a local stream, show it in our video tag and add it to be sent
    await navigator.mediaDevices
        .getUserMedia({video: this.localVideo, audio: this.localAudio})
        .then((stream) => {
          this.localStream = stream;
          this.localVideoTrack = stream.getVideoTracks()[0];
          this.localAudioTrack = stream.getAudioTracks()[0];
        })
        .catch((e) => console.log(e));
  }

  joinRoom = () => {
    this.localVideo = true;
    this.localAudio = true;
    this.getLocalMedia()
        .then(() => {
          if (!this.localStream) {
            this.setState({permissionDenied: true});
          } else {
            this.setState({permissionDenied: false});
            this.setState({joined: true});
            this.navigationBarRef.current.hideLoginIcon();
            this.connectServer();
          }
        })
        .catch((e) => console.log(e));
  }

  resendSdpSignalToServer = () => {
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

  removeTrackOfLocalStream = (kind) => {
    this.localStream = new MediaStream();
    if (kind === 'video') {
      this.localVideo = false;
      this.localScreen = false;
      this.localVideoTrack = null;
      if (this.localAudioTrack) {
        this.localStream.addTrack(this.localAudioTrack);
      }
    }
    if (kind === 'audio') {
      this.localAudio = false;
      this.localAudioTrack = null;
      if (this.localVideoTrack) {
        this.localStream.addTrack(this.localVideoTrack);
      }
    }
  }

  onHandleVideo = (localVideoState) => {
    if (localVideoState === true) {
      let getMedia = async () => {};
      if (this.localScreen === false) {
        this.localVideo = true;
        getMedia = this.getLocalMedia;
      } else {
        getMedia = this.getDisplayMedia;
      }
      getMedia()
          .then(() => {
            this.videoBoxManagerRef.current
                .handleTrack(this.userId, this.localVideoTrack);
            this.userList.forEach((user) => {
              const userId = user.userId;
              if (userId === this.userId) return;
              this.sender[userId]['videoTrack'] = this.rtcPeerConn[userId]
                  .addTrack(this.localVideoTrack, this.localStream);
            });
          })
          .catch((e) => {
            console.log(e);
            if (this.localScreen) this.localScreen = false;
            this.mediaControllerRef.current.changeToStopScreenShareIcon();
          });
    }
    if (localVideoState === false) {
      this.videoBoxManagerRef.current.stopStreamedVideo(this.userId);
      this.userList.forEach((user) => {
        const userId = user.userId;
        if (userId === this.userId) return;
        this.rtcPeerConn[userId]
            .removeTrack(this.sender[userId]['videoTrack']);
      });
      this.removeTrackOfLocalStream('video');
    }

    this.resendSdpSignalToServer();
  }

  onHandleAudio = (localAudioState) => {
    // Turn on microphone
    if (localAudioState === true) {
      this.localAudio = true;
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

        this.rtcPeerConn[userId]
            .removeTrack(this.sender[userId]['audioTrack']);
      });
      this.removeTrackOfLocalStream('audio');
    }

    this.resendSdpSignalToServer();
  }

  onHandleCamera = (localCameraState) => {
    if (localCameraState === true) {
      if (this.localScreen === true) {
        this.onHandleVideo(false);
        this.mediaControllerRef.current.changeToStopScreenShareIcon();
      }
      this.localVideo = true;
      this.onHandleVideo(true);
    }
    if (localCameraState === false) {
      this.onHandleVideo(false);
    }
  }

  onHandleScreen = (localScreenState) => {
    if (localScreenState === true) {
      if (this.localVideo === true) {
        this.onHandleVideo(false);
        this.mediaControllerRef.current.changeToVideocamOffIcon();
      }
      this.localScreen = true;
      this.onHandleVideo(true);
    }
    if (localScreenState === false) {
      this.onHandleVideo(false);
    }
  }

  callEnd = () => {
    Object.keys(this.rtcPeerConn).forEach((k) => this.rtcPeerConn[k].close());
    window.location.href = '/';
  }

  onOpenChatRoom = () => {
    this.chatRoomRef.current.openChatRoom();
  }

  onCloseChatRoom = () => {
    this.mediaControllerRef.current.closeChatRoom();
  }

  onSendMessage = (inputMessage) => {
    if (!this.socket) return;
    this.socket.emit('text message', this.roomId, this.state.username,
        inputMessage);
  }

  onUpdateUserProfile = (username) => {
    this.setState({username: username});
    this.chatRoomRef.current.changeUsername(username);
    // this.userProfilePictureUrl = userProfilePictureUrl;

    console.log('username in meeting room', username);
    // console.log('profile pic in meeting room', userProfilePictureUrl);
  }

  render() {
    return (
      <Box className={this.classes.mainRoom}>

        <NavigationBar
          ref={this.navigationBarRef}
          onUpdateUserProfile={this.onUpdateUserProfile}
        />

        {
          this.state.permissionDenied ?
              <Typography align="center" color="primary" variant="h2">
                <br /><br />IVCS needs to use your microphone and camera.<br />
                <br />Select Allow when your browser asks for permissions.<br />
              </Typography> : null
        }

        <Box className={this.classes.meetingRoom}>
          {
            this.state.joined || this.state.permissionDenied ? null :
                <Container align="center"
                  className={this.classes.joinNowContainer}>
                  <Box className={this.classes.title}>
                    <Typography align="center" color="primary" variant="h2">
                      IVCS
                    </Typography>
                  </Box>
                  <Input
                    onChange={(e) => this.changeUsername(e)}
                    placeholder="username"
                    value={this.state.username}
                    className={this.classes.inputText}
                  />
                  <Button variant="contained" color="primary"
                    className={this.classes.joinNowButton}
                    startIcon={<VoiceChatOutlinedIcon />}
                    onClick={this.joinRoom}>
                    Join Now
                  </Button>
                </Container>
          }
          <VideoBoxManager ref={this.videoBoxManagerRef} />
        </Box>

        <ChatRoom
          ref={this.chatRoomRef}
          onSendMessage={this.onSendMessage}
          onCloseChatRoom={this.onCloseChatRoom}
          username={this.state.username}
        />

        {
          this.state.joined ?
              <MediaController
                ref={this.mediaControllerRef}
                onHandleVideo={this.onHandleCamera}
                onHandleAudio={this.onHandleAudio}
                onHandleScreen={this.onHandleScreen}
                onOpenChatRoom={this.onOpenChatRoom}
                onCallEnd={this.callEnd}
              /> :
              null
        }

      </Box>
    );
  }
}

MeetingRoom.propTypes = {
  updateUserProfile: PropTypes.func,
};

export default withStyles(styles)(MeetingRoom);
