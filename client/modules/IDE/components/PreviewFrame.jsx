import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getConfig from '../../../utils/getConfig';
import { registerFrame } from '../../../utils/dispatcher';

function PreviewFrame({ fullView }) {
  const iframe = useRef();
  const previewUrl = getConfig('PREVIEW_URL');
  useEffect(() => {
    const unsubscribe = registerFrame(iframe.current.contentWindow, previewUrl);
    return () => {
      unsubscribe();
    };
  });

  // TODO move this to styled components
  const iframeClass = classNames({
    'preview-frame': true,
    'preview-frame--full-view': fullView
  });
  const frameUrl = previewUrl;
  const sandboxAttributes =
    'allow-scripts allow-pointer-lock allow-popups allow-forms allow-modals allow-downloads allow-same-origin';
  return (
    <iframe
      title="sketch preview"
      src={frameUrl}
      className={iframeClass}
      sandbox={sandboxAttributes}
      frameBorder="0"
      ref={iframe}
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
