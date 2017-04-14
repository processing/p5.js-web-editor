import React, { PropTypes } from 'react';
import { format, parse } from 'url';

/**
 * A Higher Order Component that forces the protocol to change on mount
 *
 * targetProtocol: the protocol to redirect to on mount
 * sourceProtocol: the protocol to redirect back to on unmount
 * disable: if true, the redirection will not happen but what should
 *          have happened will be logged to the console
 */
const forceProtocol = ({ targetProtocol = 'https', sourceProtocol, disable = false }) => WrappedComponent => (
  class ForceProtocol extends React.Component {
    static propTypes = {}

    componentDidMount() {
      this.redirectToProtocol(targetProtocol, { appendSource: true });
    }

    componentWillUnmount() {
      if (sourceProtocol != null) {
        this.redirectToProtocol(sourceProtocol, { appendSource: false });
      }
    }

    redirectToProtocol(protocol, { appendSource }) {
      const currentProtocol = parse(window.location.href).protocol;

      if (protocol !== currentProtocol) {
        if (disable === true) {
          console.info(`forceProtocol: would have redirected from "${currentProtocol}" to "${protocol}"`);
        } else {
          const url = parse(window.location.href, true /* parse query string */);
          url.protocol = protocol;
          if (appendSource === true) {
            url.query.source = currentProtocol;
          }
          window.location = format(url);
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
);

const protocols = {
  http: 'http:',
  https: 'https:',
};

const findSourceProtocol = (state, location) => {
  if (/source=https/.test(window.location.search)) {
    return protocols.https;
  } else if (/source=http/.test(window.location.search)) {
    return protocols.http;
  } else if (state.project.serveSecure === true) {
    return protocols.https;
  }

  return protocols.http;
};

export default forceProtocol;
export {
  findSourceProtocol,
  protocols,
};
