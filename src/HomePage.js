import React from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {withStyles} from '@material-ui/styles';
import MeetingLink from './MeetingLink';
import Carousel from './Carousel';

const styles = () => ({
  main: {
    backgroundColor: '#505355',
    margin: '100px',
    padding: '30px',
    width: 'auto',
    height: 'auto',
  },
  banner: {
    backgroundColor: '#cfe8fc',
    margin: '50px',
  },
});

class HomePage extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = {url: ''};
  // }

  render() {
    const {classes} = this.props;
    return (
      <Container component="main" align="center" className={classes.main}>
        <Typography component="h2" align="center" className={classes.banner}>
          IVCS (Instant Video Conferencing Service)
        </Typography>
        <MeetingLink />
        <Carousel />
      </Container>
    );
  }
}

export default withStyles(styles)(HomePage);
