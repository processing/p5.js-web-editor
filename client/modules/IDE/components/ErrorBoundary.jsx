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

export default ErrorBoundary;
