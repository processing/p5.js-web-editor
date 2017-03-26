import React, { PropTypes } from 'react';

/**
 * A Higher Order Component that forces the protocol to change on mount
 *
 * targetProtocol: the protocol to redirect to on mount
 * sourceProtocol: the protocol to redirect back to on unmount
 * disable: if true, the redirection will not happen but what should
 *          have happened will be logged to the console
 */
const forceProtocol = ({ targetProtocol = 'https:', sourceProtocol, disable = false }) => WrappedComponent => (
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
        if (disable === true) {
          console.info(`forceProtocol: would have redirected from "${currentProtocol}" to "${protocol}"`);
        } else {
          window.location = window.location.href.replace(currentProtocol, protocol);
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
);


export default forceProtocol;
