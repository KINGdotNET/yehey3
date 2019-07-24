import React from 'react';
import { withRouter } from 'react-router';

class ScrollToBottomOnMount extends React.Component {
  componentDidMount() {
    if (window && window.location.hash === '') {
      window.scrollTo(0, 1000000); 
    }
  }

  render() {
    return null;
  }
}

export default withRouter(ScrollToBottomOnMount);
