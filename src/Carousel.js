import React from 'react';
import Carousel from 'react-material-ui-carousel';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/styles/withStyles';
import Carousel1 from './assets/img/carousel01.jpg';
import Carousel2 from './assets/img/carousel02.jpg';

const styles = () => ({
  carousel: {
    position: 'absolute',
    display: 'block',
    width: '35%',
    height: '50%',
    margin: '5% 5%',
    left: '45%',
    top: '15%',
    float: 'left',
    borderRadius: '15px',
    backgroundColor: 'transparent',
    boxShadow: 'inset 0px 3px 5px rgba(255,255,255,0.5),' +
        ' 0px 0px 10px rgba(0,0,0,0.15)',
  },
  paperContainer: {
    position: 'absolute',
    width: '100%',
    height: '90px',
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
      <Paper>
        <img style={{width: '100%'}} alt="true" src={props.item.image}/>
      </Paper>
    );
  }

  render() {
    return (
      <Carousel className={this.classes.carousel}>
        {
          this.items.map((item, i) => <this.item key={i} item={item}/>)
        }
      </Carousel>
    );
  }
}

export default withStyles(styles)(MyCarousel);
