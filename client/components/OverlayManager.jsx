import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const OverlayManager = ({ overlay, hideOverlay }) => {
  // const [visible, trigger, setRef] = useModalBehavior();

  const jsx = (
    <React.Fragment>
      {/* <div ref={setRef} >
        {visible && <Dropdown items={headerNavOptions} />}
      </div> */}
    </React.Fragment>
  );

  return jsx && createPortal(jsx, document.body);
};

OverlayManager.propTypes = {
  overlay: PropTypes.string,
  hideOverlay: PropTypes.func.isRequired
};

OverlayManager.defaultProps = { overlay: null };

export default OverlayManager;
