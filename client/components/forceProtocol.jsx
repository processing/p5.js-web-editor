import React from 'react';
import { format, parse } from 'url';

const findCurrentProtocol = () => (
  parse(window.location.href).protocol
);

const redirectToProtocol = (protocol, { appendSource, disable = false } = {}) => {
  const currentProtocol = findCurrentProtocol();

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
};

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
      redirectToProtocol(targetProtocol, { appendSource: true, disable });
    }

    componentWillUnmount() {
      if (sourceProtocol != null) {
        redirectToProtocol(sourceProtocol, { appendSource: false, disable });
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
  findCurrentProtocol,
  findSourceProtocol,
  redirectToProtocol,
  protocols,
};
