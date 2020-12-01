import React from 'react';
import Carousel from 'react-material-ui-carousel';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/styles/withStyles';
import Carousel1 from './assets/img/carousel01.jpg';
import Carousel2 from './assets/img/carousel02.jpg';

const styles = () => ({
  carousel: {
    display: 'inline-flex',
    width: 'auto',
    height: '100%',
    borderRadius: '15px',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  paper: {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    borderRadius: '15px',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  img: {
    width: '450px',
    height: '280px',
    objectFit: 'fill',
    ['@media screen and (max-aspect-ratio: 1/2),' +
    ' only screen and (max-width: 35rem)']: {
      width: '360px',
      height: '280px',
    },
  },
});

class MyCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.items = [{image: Carousel1}, {image: Carousel2}];
  }

  item = (props) => {
    return (
      <Paper className={this.classes.img}>
        <img className={this.classes.paper} alt="true" src={props.item.image}/>
      </Paper>
    );
  }

  render() {
    return (
      <Carousel
        indicators={false}
        fullHeightHover={false}
        className={this.classes.carousel}>
        {
          this.items.map((item, i) => <this.item key={i} item={item}/>)
        }
      </Carousel>
    );
  }
}

export default withStyles(styles)(MyCarousel);
