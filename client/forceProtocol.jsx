import React, { PropTypes } from 'react';

/**
 * A Higher Order Component that forces the protocol to change on mount
 *
 */
const forceProtocol = ({ targetProtocol = 'https:' }) => WrappedComponent => (
  class ForceProtocol extends React.Component {
    static propTypes = {}

    componentDidMount() {
      const currentProtocol = window.location.protocol;

      if (targetProtocol !== currentProtocol) {
        window.location = window.location.href.replace(currentProtocol, targetProtocol);
      }
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
);


export default forceProtocol;
