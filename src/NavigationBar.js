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
  head: {
    position: 'relative',
    display: 'block',
    minWidth: '320px',
    width: '100%',
  },
  root: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    height: '64px',
    position: 'relative',
    padding: '8px',
    display: 'flex',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  menuButton: {
    zIndex: 999,
    left: 0,
  },
  accountButton: {
    zIndex: 999,
    position: 'absolute',
    right: 0,
  },
});

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.state = {
      showLoginIcon: window.location.pathname.substr(1),
      userProfilePictureUrl: null,
    };
  }

  hideLoginIcon = () => {
    this.setState({showLoginIcon: false});
  }

  updateUserProfile = (username, userProfilePictureUrl) => {
    this.setState({userProfilePictureUrl: userProfilePictureUrl});
    this.props.onUpdateUserProfile(username);
  }

  render() {
    return (
      <Box className={this.classes.head}>

        <AppBar position="static" className={this.classes.root}>

          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={this.classes.menuButton}
              color="primary"
            >

              <MenuIcon />

            </IconButton>

            <Typography variant="h6" color="primary">
              IVCS
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
