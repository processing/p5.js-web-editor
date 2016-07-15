import React, { PropTypes } from 'react';

function NewFileForm(props) {
  const { fields: { name }, handleSubmit } = props;
  return (
    <form className="new-file-form" onSubmit={handleSubmit(props.createFile.bind(this))}>
      <label className="new-file-form__name-label" htmlFor="name">Name:</label>
      <input
        className="new-file-form__name-input"
        id="name"
        type="text"
        placeholder="Name"
        {...name}
      />
      <input type="submit" value="Add File" />
    </form>
  );
}

NewFileForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired
};

export default NewFileForm;
