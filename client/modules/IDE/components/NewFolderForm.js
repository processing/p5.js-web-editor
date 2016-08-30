import React, { PropTypes } from 'react';

class NewFolderForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFolder = this.props.createFolder.bind(this);
  }

  render() {
    const { fields: { name }, handleSubmit } = this.props;
    return (
      <form className="new-folder-form" onSubmit={handleSubmit(this.createFolder)}>
        <label className="new-folder-form__name-label" htmlFor="name">Name:</label>
        <input
          className="new-folder-form__name-input"
          id="name"
          type="text"
          placeholder="Name"
          ref="fileName"
          {...name}
        />
        <input type="submit" value="Add Folder" aria-label="add folder" />
      </form>
    );
  }
}

NewFolderForm.propTypes = {
  fields: PropTypes.shape({
    name: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  createFolder: PropTypes.func.isRequired
};

export default NewFolderForm;
