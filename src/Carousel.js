import React from 'react';
import Button from '@material-ui/core/Button';
import Carousel from 'react-material-ui-carousel';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/styles/withStyles';

const useStyles = () => ({
  carousel: {
    background: 'white',
    width: '35%',
    height: 'auto',
    margin: '10%',
  },
  meetingLinkTitle: {
    margin: 0,
    fontWeight: 'bold',
    paddingRight: '50px',
  },
});

function Item(props) {
  return (
    <Paper>
      <h2>{props.item.name}</h2>
      <p>{props.item.description}</p>

      <Button className="CheckButton">
          Check it out!
      </Button>
    </Paper>
  );
}

class MyCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {urlBackHalf: ''};

    this.items = [
      {
        name: 'Random Name #1',
        description: 'Probably the most random thing you have ever seen!',
      },
      {
        name: 'Random Name #2',
        description: 'Hello World!',
      },
    ];
  }

  render() {
    const {classes} = this.props;
    return (
      <Carousel className={classes.carousel}>
        {
          this.items.map((item, i) => <Item key={i} item={item}/>)
        }
      </Carousel>
    );
  }
}

export default withStyles(useStyles)(MyCarousel);
