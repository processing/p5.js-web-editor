import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="app">
        { this.props.children }
      </div>
    );
  }
}

export default connect()(App);