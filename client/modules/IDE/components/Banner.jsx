import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { CrossIcon } from '../../../common/icons';

/**
 * Banner displays a dismissible announcement bar with a link and a close icon.
 * It's typically used to highlight opportunities, but use and design can be flexible.
 *
 * This component is **presentational only** — visibility logic (open/close state) should be
 * controlled by the parent via the `onClose` handler.
 *
 * @param {Object} props
 * @param {function} props.onClose - Function called when the user clicks the close (✕) button
 * @returns {JSX.Element} The banner component with a call-to-action link and a close button
 *
 * @example
 * const [showBanner, setShowBanner] = useState(true);
 *
 * {showBanner && (
 *   <Banner onClose={() => setShowBanner(false)} />
 * )}
 */

const Banner = ({ onClose }) => {
  // URL can be updated depending on the opportunity or announcement.
  const bannerURL = 'https://processingfoundation.org/donate';

  const bannerCopy = (
    <>
      <Trans i18nKey="Banner.Copy" components={{ bold: <strong /> }} />
    </>
  );

  return (
    <div className="banner">
      <a href={bannerURL}>{bannerCopy}</a>
      <button className="banner-close-button" onClick={onClose}>
        <CrossIcon icon={{ default: '#000', hover: '#333' }} />
      </button>
    </div>
  );
};

Banner.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default Banner;
