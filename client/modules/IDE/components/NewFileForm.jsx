import React, { PropTypes } from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

class NewFileForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFile = this.props.createFile.bind(this);
  }

  componentDidMount() {
    this.refs.fileName.focus();
  }

  render() {
    const { fields: { name }, handleSubmit } = this.props;
    return (
      <form className="new-file-form" onSubmit={handleSubmit(this.createFile)}>
        <label className="new-file-form__name-label" htmlFor="name">Name:</label>
        <input
          className="new-file-form__name-input"
          id="name"
          type="text"
          placeholder="Name"
          ref="fileName"
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
  createFile: PropTypes.func.isRequired
};

export default NewFileForm;
