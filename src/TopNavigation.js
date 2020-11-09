import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {withStyles} from '@material-ui/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Container from '@material-ui/core/Container';

const navStyles = () => ({
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

class TopNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleMenu = (event) => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  render() {
    const {classes} = this.props;
    return (
      <Container disableGutters = {true} className={classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton edge="start" className={classes.menuButton}
              color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" color="inherit">
                          Menu
            </Typography>
            <div className={classes.accountButton}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={this.handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(this.state.anchorEl)}
                onClose={this.handleClose}
              >
                <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                <MenuItem onClick={this.handleClose}>My account</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
      </Container>
    );
  }
}

export default withStyles(navStyles)(TopNavigation);
