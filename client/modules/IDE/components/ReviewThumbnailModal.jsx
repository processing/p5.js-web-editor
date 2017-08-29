import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

class ReviewThumbnailModal extends React.Component {
  componentDidMount() {
    this.reviewThumbnailModal.focus();
  }

  componentDidUpdate() {
    if (this.props.thumbnailImg !== null) {
      this.thumbnailPreview.src = this.props.thumbnailImg;
    }
  }

  render() {
    return (
      <section className="review-thumbnail-modal" ref={(element) => { this.reviewThumbnailModal = element; }} tabIndex="0">
        <header className="review-thumbnail-modal__header">
          <h2 className="review-thumbnail-modal__header-title">Edit Project Thumbnail</h2>
          <button className="review-thumbnail-modal__exit-button" onClick={this.props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close Thumbnail Preview" />
          </button>
        </header>
        <img
          alt="Thumbnail preview"
          className="review-thumbnail-modal__thumbnail-preview"
          ref={(element) => { this.thumbnailPreview = element; }}
        />
      </section>
    );
  }
}

ReviewThumbnailModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  thumbnailImg: PropTypes.string.isRequired,
};

export default ReviewThumbnailModal;
