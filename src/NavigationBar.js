import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import withStyles from '@material-ui/styles/withStyles';
import SocialLogin from './SocialLogin';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';

const styles = () => ({
  root: {
    flexGrow: 1,
    margin: 0,
    width: '100%',
    height: '10%',
    maxWidth: '100%',
    disableGutters: 'true',
  },
  menuButton: {
    left: 0,
  },
  accountButton: {
    position: 'absolute',
    right: 0,
  },
});

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state = {
      anchorEl: null,
      showLoginIcon: window.location.pathname.substr(1),
      userProfilePictureUrl: null,
    };
  }

  hideLoginIcon = () => {
    this.setState({showLoginIcon: false});
  }

  handleMenu = (event) => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  updateUserProfile = (username, userProfilePictureUrl) => {
    this.setState({userProfilePictureUrl: userProfilePictureUrl});
    this.props.onUpdateUserProfile(username);
  }

  render() {
    return (
      <Box className={this.classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={this.classes.menuButton}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" color="inherit">
              Menu
            </Typography>

            {
              !this.state.showLoginIcon ? null :
              <Box className={this.classes.accountButton}>
                {
                  !this.state.userProfilePictureUrl ?
                    <SocialLogin updateUserProfile={this.updateUserProfile} /> :
                    <Avatar src={this.state.userProfilePictureUrl} />
                }
              </Box>
            }

          </Toolbar>
        </AppBar>
      </Box>
    );
  }
}

export default withStyles(styles)(NavigationBar);
