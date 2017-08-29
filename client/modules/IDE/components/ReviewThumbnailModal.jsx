import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

class ReviewThumbnailModal extends React.Component {
  componentDidMount() {
    this.reviewThumbnailModal.focus();
  }
  render() {
    return (
      <section className="review-thumbnail-modal" ref={(element) => { this.reviewThumbnailModal = element; }} tabIndex="0">
        Does this look ok to you????
      </section>
    );
  }
}

ReviewThumbnailModal.propTypes = {};

export default ReviewThumbnailModal;
