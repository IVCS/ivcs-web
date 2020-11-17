import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import withStyles from '@material-ui/styles/withStyles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Container from '@material-ui/core/Container';

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
    };
  }

  handleMenu = (event) => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  render() {
    return (
      <Container disableGutters="true" className={this.classes.root}>
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

            <div className={this.classes.accountButton}>
              <IconButton onClick={this.handleMenu} color="inherit">
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={this.state.anchorEl}
                keepMounted
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

export default withStyles(styles)(NavigationBar);
