import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';


import Button from '../../../common/Button';

class UploadFileByURLForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFile = this.props.createFile.bind(this);
  }

  componentDidMount() {
    this.fileName.focus();
  }


  render() {
    const {
      fields: { url },
      handleSubmit,
    } = this.props;
    return (
      <form
        className="upload-file-by-url-form"
        onSubmit={(data) => {
          this.props.focusOnModal();
          handleSubmit(this.props.uploadFileByURL)(data);
        }}
      >
        <div className="upload-file-by-url-form__input-wrapper">
          <label className="upload-file-by-url-form__url-label" htmlFor="url">
            {this.props.t('UploadFileByURLForm.Label')}
          </label>
          <input
            className="upload-file-by-url-form__url-input"
            name="url"
            id="url"
            type="text"
            placeholder={this.props.t('UploadFileByURLForm.Placeholder')}
            ref={(element) => { this.fileName = element; }}
            {...domOnlyProps(url)}
          />
          <Button
            type="submit"
            className="upload-file-by-url-form__submit"
          >{this.props.t('UploadFileByURLForm.Submit')}
          </Button>
        </div>
        {url.touched && url.error && (
          <span className="form-error">{url.error}</span>
        )}
      </form>
    );
  }
}

UploadFileByURLForm.propTypes = {
  fields: PropTypes.shape({
    url: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  uploadFileByURL: PropTypes.func.isRequired,
  focusOnModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(UploadFileByURLForm);
