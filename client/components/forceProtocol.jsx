import React, { PropTypes } from 'react';

/**
 * A Higher Order Component that forces the protocol to change on mount
 *
 */
const forceProtocol = ({ targetProtocol = 'https:', sourceProtocol }) => WrappedComponent => (
  class ForceProtocol extends React.Component {
    static propTypes = {}

    componentDidMount() {
      this.redirectToProtocol(targetProtocol);
    }

    componentWillUnmount() {
      if (sourceProtocol != null) {
        this.redirectToProtocol(sourceProtocol);
      }
    }

    redirectToProtocol(protocol) {
      const currentProtocol = window.location.protocol;

      if (protocol !== currentProtocol) {
        window.location = window.location.href.replace(currentProtocol, protocol);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
);


export default forceProtocol;
