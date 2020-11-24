import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import GoogleLogin from 'react-google-login';

const styles = () => ({
  videoBox: {
    marginRight: '20px',
    lineHeight: '225px',
    textAlign: 'center',
  },
});

class SocialLogin extends React.Component {
  constructor(props) {
    super(props);

    this.classes = this.props.classes;

    this.username = null;
    this.profilePictureUrl = null;
    this.profilePictureDataUrl = null;
    this.googleId = null;

    this.socialLoginContext = React.createContext();
  }

  toDataUrl = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  responseGoogle = (response) => {
    if (response['profileObj']) {
      console.log(response['profileObj']);
      this.username = response['profileObj']['name'];
      this.profilePictureUrl = response['profileObj']['imageUrl'];

      this.toDataUrl(this.profilePictureUrl, (myBase64) => {
        this.props.updateUserProfile(this.username, myBase64);
      });
    } else {
      console.log('Error response', response);
    }
  }

  render() {
    return (
      <GoogleLogin
        clientId="1090486960272-7uvbr814khpldaa5d5m0kle52btk35op.apps.googleusercontent.com"
        buttonText="Login with Google"
        onSuccess={this.responseGoogle}
        onFailure={this.responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    );
  }
}

export default withStyles(styles)(SocialLogin);
