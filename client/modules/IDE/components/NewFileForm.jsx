import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

class NewFileForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFile = this.props.createFile.bind(this);
  }

  render() {
    const { fields: { name }, handleSubmit } = this.props;
    return (
      <form
        className="new-file-form"
        onSubmit={(data) => {
          this.props.focusOnModal();
          handleSubmit(this.createFile)(data);
        }}
      >
        <label className="new-file-form__name-label" htmlFor="name">Name:</label>
        <input
          className="new-file-form__name-input"
          id="name"
          type="text"
          placeholder="Name"
          {...domOnlyProps(name)}
        />
        <input type="submit" value="Add File" aria-label="add file" />
        {name.touched && name.error && <span className="form-error">{name.error}</span>}
      </form>
    );
  }
}

NewFileForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  focusOnModal: PropTypes.func.isRequired
};

export default NewFileForm;
