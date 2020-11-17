import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import DOMPurify from 'dompurify';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const styles = () => ({
  dialogContent: {
    height: '400px',
    width: '400px',
  },
  username: {
    display: 'inline',
    fontWeight: 'bold',
  },
  message: {
    display: 'inline',
    wordBreak: 'break-all',
  },
  dialogActions: {
    padding: '16px 24px',
  },
});

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.username = this.props.username;

    this.inputRef = React.createRef();
    this.messagesEndRef = React.createRef();

    this.state = {
      showChatRoom: false,
      inputMessage: '',
      totalMessages: [],
    };
  }

  changeUsername = (username) => this.username = username;

  closeChatRoom = () => {
    this.setState({showChatRoom: false});
    this.props.onCloseChatRoom();
  }

  openChatRoom = () => this.setState({showChatRoom: true, newMessages: 0})

  handleMessage = (e) => this.setState({inputMessage: e.target.value})

  addMessage = (username, message) => {
    this.setState({
      totalMessages: this.state.totalMessages.concat({
        'username': username,
        'message': message,
      }),
    });
    if (this.state.showChatRoom) {
      this.scrollToBottom();
    }
  }

  pressEnterToSendMessage = (e) => {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage = () => {
    this.inputRef.current.focus();
    if (this.state.inputMessage === '') return;
    const cleanInputMessage = DOMPurify.sanitize(this.state.inputMessage);
    this.addMessage(this.username, cleanInputMessage);
    this.props.onSendMessage(cleanInputMessage);
    this.setState({inputMessage: ''});
  }

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
  }

  render() {
    return (
      <Dialog open={this.state.showChatRoom} onClose={this.closeChatRoom}>

        <DialogTitle>Chat room</DialogTitle>

        <DialogContent className={this.classes.dialogContent}>
          <DialogContentText>
            {
              this.state.totalMessages.length > 0 ?
                  this.state.totalMessages.map((item, index) => (
                    <Box key={index}>
                      <Typography className={this.classes.username}>
                        {item.username}:&nbsp;
                      </Typography>
                      <Typography className={this.classes.message}>
                        {item.message}
                      </Typography>
                    </Box>
                  )) :
                  <Typography>No message yet</Typography>
            }
          </DialogContentText>
          <Box ref={this.messagesEndRef} />
        </DialogContent>

        <DialogActions className={this.classes.dialogActions}>
          <Input autoFocus="true" fullWidth="true" inputRef={this.inputRef}
            onChange={(e) => this.handleMessage(e)}
            placeholder="Message" value={this.state.inputMessage}
            onKeyPress={(e) => this.pressEnterToSendMessage(e)}
          />
          <Button color="primary" variant="contained"
            onClick={this.sendMessage}>
              Send
          </Button>
        </DialogActions>

      </Dialog>
    );
  }
}

export default withStyles(styles)(ChatRoom);
