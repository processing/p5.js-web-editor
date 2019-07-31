import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorOccurred: false };
  }

  componentDidCatch(error, info) {
    this.setState({ errorOccurred: true });
  }

  render() {
    return this.state.errorOccurred ? 'Something went wrong!' : this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

ErrorBoundary.defaultProps = {
  children: ''
};

export default ErrorBoundary;
