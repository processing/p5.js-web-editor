import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import FileUploader from './FileUploader';
import { getreachedTotalSizeLimit } from '../selectors/users';

import exitUrl from '../../../images/exit.svg';

class UploadFileModal extends React.Component {
  propTypes = {
    reachedTotalSizeLimit: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.focusOnModal();
  }

  focusOnModal = () => {
    this.modal.focus();
  }


  render() {
    return (
      <section className="modal" ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">Upload File</h2>
            <button className="modal__exit-button" onClick={this.props.closeModal}>
              <InlineSVG src={exitUrl} alt="Close New File Modal" />
            </button>
          </div>
          { this.props.reachedTotalSizeLimit &&
            <p>
              {
                `Error: You cannot upload any more files. You have reached the total size limit of 250MB.
                If you would like to upload more, please remove the ones you aren't using anymore by
                in your `
              }
              <Link to="/assets">assets</Link>
              {'.'}
            </p>
          }
          { !this.props.reachedTotalSizeLimit &&
            <div>
              <FileUploader />
            </div>
          }
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    reachedTotalSizeLimit: getreachedTotalSizeLimit(state)
  };
}

export default connect(mapStateToProps)(UploadFileModal);
