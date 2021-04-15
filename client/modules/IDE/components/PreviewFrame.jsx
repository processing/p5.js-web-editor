import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import getConfig from '../../../utils/getConfig';
import { registerFrame } from '../../../utils/dispatcher';

const Frame = styled.iframe`
  min-height: 100%;
  min-width: 100%;
  position: ${(props) => (props.fullView ? 'relative' : 'absolute')};
  border-width: 0;
`;

function PreviewFrame({ fullView }) {
  const iframe = useRef();
  const previewUrl = getConfig('PREVIEW_URL');
  useEffect(() => {
    const unsubscribe = registerFrame(iframe.current.contentWindow, previewUrl);
    return () => {
      unsubscribe();
    };
  });

  const frameUrl = previewUrl;
  const sandboxAttributes = `allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups 
    allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation`;
  const allow =
    'accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; magnetometer; midi; vr;';
  return (
    <Frame
      title="sketch preview"
      src={frameUrl}
      sandbox={sandboxAttributes}
      allow={allow}
      scrolling="auto"
      allowtransparency
      allowpaymentrequest
      allowFullScreen
      frameBorder="0"
      ref={iframe}
      fullView={fullView}
    />
  );
}

PreviewFrame.propTypes = {
  fullView: PropTypes.bool
};

PreviewFrame.defaultProps = {
  fullView: false
};

export default PreviewFrame;
