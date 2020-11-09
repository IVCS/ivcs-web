import React from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import withStyles from '@material-ui/styles/withStyles';
import MeetingLink from './MeetingLink';
import Carousel from './Carousel';
import TopNavigation from './TopNavigation';
const homeStyles = () => ({
  fullScreen: {
    position: 'fixed',
    margin: 0,
    left: '0px',
    top: '0px',
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'auto',
  },
  main: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    margin: 0,
    padding: '30px',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  banner: {
    backgroundColor: '#FFFFFF',
    margin: '50px',
    fontWeight: 'bold',
    textDecoration: 'blink',
    textShadow: 'hShadow, vShadow, onBlurCapture',
  },
});

class HomePage extends React.Component {
  render() {
    const classes = this.props.classes;
    return (
      <Container disableGutters = {true} className={classes.fullScreen}>
        <TopNavigation/>
        <Container disableGutters = {true} component="main" align="center"
          className={classes.main}>
          <Typography variant="h2" component="h2" align="center"
            className={classes.banner}>
              IVCS (Instant Video Conferencing Service)
          </Typography>
          <MeetingLink />
          <Carousel />
        </Container>
      </Container>
    );
  }
}

export default withStyles(homeStyles)(HomePage);
