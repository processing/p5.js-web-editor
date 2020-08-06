import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

import Button from '../../../common/Button';


class NewFolderForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFolder = this.props.createFolder.bind(this);
  }

  componentDidMount() {
    this.fileName.focus();
  }

  render() {
    const {
      fields: { name }, handleSubmit
    } = this.props;
    return (
      <form
        className="new-folder-form"
        onSubmit={(data) => {
          handleSubmit(this.createFolder)(data);
        }}
      >
        <div className="new-folder-form__input-wrapper">
          <label className="new-folder-form__name-label" htmlFor="name">Name:</label>
          <input
            className="new-folder-form__name-input"
            id="name"
            type="text"
            maxLength="128"
            placeholder={i18n.t('NewFolderForm.Placeholder')}
            ref={(element) => { this.fileName = element; }}
            {...domOnlyProps(name)}
          />
          <Button
            type="submit"
          >{i18n.t('NewFolderForm.AddFolderSubmit')}
          </Button>
        </div>
        {name.touched && name.error && <span className="form-error">{name.error}</span>}
      </form>
    );
  }
}

NewFolderForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFolder: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool
};
NewFolderForm.defaultProps = {
  submitting: false,
  pristine: true
};
export default NewFolderForm;
