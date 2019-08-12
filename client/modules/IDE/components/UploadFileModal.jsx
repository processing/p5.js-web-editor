import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import FileUploader from './FileUploader';
import { getreachedTotalSizeLimit } from '../selectors/users';

class UploadFileModal extends React.Component {
  propTypes = {
    reachedTotalSizeLimit: PropTypes.bool.isRequired
  }

  render() {
    return (
      <section className="modal" ref={(element) => { this.modal = element; }}>
        { this.props.reachedTotalSizeLimit &&
          <p>
            {
              `You have reached the size limit for the number of files you can upload to your account.
              If you would like to upload more, please remove the ones you aren't using anymore by
              looking through your `
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
