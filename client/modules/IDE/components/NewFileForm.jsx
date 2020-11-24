import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

import Button from '../../../common/Button';

class NewFileForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFile = this.props.createFile.bind(this);
  }

  componentDidMount() {
    this.fileName.focus();
  }

  render() {
    const {
      fields: { name },
      handleSubmit,
    } = this.props;
    return (
      <form
        className="new-file-form"
        onSubmit={(data) => {
          this.props.focusOnModal();
          handleSubmit(this.createFile)(data);
        }}
      >
        <div className="new-file-form__input-wrapper">
          <label className="new-file-form__name-label" htmlFor="name">
            Name:
          </label>
          <input
            className="new-file-form__name-input"
            id="name"
            type="text"
            placeholder={this.props.t('NewFileForm.Placeholder')}
            maxLength="128"
            {...domOnlyProps(name)}
            ref={(element) => {
              this.fileName = element;
            }}
          />
          <Button
            type="submit"
          >{this.props.t('NewFileForm.AddFileSubmit')}
          </Button>
        </div>
        {name.touched && name.error && (
          <span className="form-error">{name.error}</span>
        )}
      </form>
    );
  }
}

NewFileForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.objectOf(PropTypes.shape())
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  focusOnModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(NewFileForm);
