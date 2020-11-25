import React from 'react';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/styles/withStyles';
import MeetingLink from './MeetingLink';
import Carousel from './Carousel';
import NavigationBar from './NavigationBar';
import Background from './assets/img/poster-about.jpg';
import Cloud1 from './assets/img/poster-drop-animate1.png';
import Cloud2 from './assets/img/poster-drop-animate2.png';
import Paper from '@material-ui/core/Paper';
import Slogan from './assets/video/IVCS_Slogan.mp4';
import Box from '@material-ui/core/Box';

const styles = () => ({
  'fullScreen': {
    backgroundImage: `url(${Background})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    position: 'fixed',
    margin: 0,
    left: '0px',
    top: '0px',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  '@keyframes posterDrop1': {
    from: {backgroundPosition: '0 0'},
    to: {backgroundPosition: '4000% 0'},
  },
  '@keyframes posterDrop2': {
    from: {backgroundPosition: '0 0'},
    to: {backgroundPosition: '3000% 0'},
  },
  '@keyframes blink': {
    '20%,24%': {
      color: '#111',
      textShadow: 'none',
    },
    '0% 19%,23%,54%,100%': {
      textShadow: ' 0 0 5px #ffa500, 0 0 15px #ffa500,' +
          ' 0 0 20px #ffa500, 0 0 40px #ffa500,' +
          ' 0 0 10px #ff8d00, 0 0 98px #ff0000',
      color: '#fff6a9',
    },
  },
  'main': {
    backgroundImage: `url(${Cloud2})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat-x',
    animation: '$posterDrop1 3000s linear infinite',
    position: 'absolute',
    margin: 0,
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'auto',
  },
  'dynamicCloud': {
    backgroundImage: `url(${Cloud1})`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'cover',
    animation: '$posterDrop2 5000s linear infinite',
    position: 'absolute',
    width: '100%',
    height: '100%',
    margin: 0,
    left: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  'banner': {
    margin: '1%',
    fontWeight: 'bold',
    textShadow: '0 0 5px #ffa500, 0 0 15px #ffa500,' +
        ' 0 0 20px #ffa500, 0 0 40px #ffa500,' +
        ' 0 0 10px #ff8d00, 0 0 98px #ff0000',
    color: '#fff6a9',
    animation: '$blink 15s linear infinite alternate',
  },
  'slogan': {
    position: 'absolute',
    width: '20%',
    height: '40%',
    margin: '5% 5%',
    top: '15%',
    right: '60%',
    float: 'left',
    borderRadius: '15px',
    backgroundSize: '100% 100%',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  'sloganVideo': {
    position: 'absolute',
    display: 'flex',
    borderRadius: '15px',
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;
  }

  render() {
    return (
      <Box className={this.classes.fullScreen}>

        <Box className={this.classes.dynamicCloud} />

        <Box component="main" align="center"
          className={this.classes.main}>

          <NavigationBar />

          <Typography variant="h4" component="h4" align="center"
            className={this.classes.banner}>
              IVCS (Instant Video Conferencing Service)
          </Typography>

          <Paper align="center" className={this.classes.slogan}>
            <video className={this.classes.sloganVideo}
              autoPlay loop="loop" src={Slogan} />
          </Paper>

          <MeetingLink />

          <Carousel />

        </Box>

      </Box>
    );
  }
}

export default withStyles(styles)(HomePage);
