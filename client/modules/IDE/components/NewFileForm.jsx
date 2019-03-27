import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

const FILE_EXTENSIONS = [
  'css',
  'csv',
  'html',
  'js',
  'json',
  'markdown',
  'svg',
  'txt',
  'tsv',
];

class NewFileForm extends React.Component {
  constructor(props) {
    super(props);
    this.createFile = this.props.createFile.bind(this);
    this.appendFileExtension = this.appendFileExtension.bind(this);
    this.isCurrentExtension = this.isCurrentExtension.bind(this);
  }

  componentDidMount() {
    this.fileName.focus();
  }

  appendFileExtension(fileExtension) {
    const { fields: { name } } = this.props;
    if (FILE_EXTENSIONS.includes(name)) {
      // remove current extension from the current fileName
    }
    // append fileExtension to the current fileName
  }

  isCurrentExtension(fileExtension) {
    const { fields: { name } } = this.props;
    const fileExtensionRegex = /(?:\.([^.]+))?$/;
    const currentFileExtension = fileExtensionRegex.exec(name.value)[1];
    return fileExtension === currentFileExtension;
  }

  render() {
    const { fields: { name }, handleSubmit } = this.props;
    return (
      <form
        onSubmit={(data) => {
          this.props.focusOnModal();
          handleSubmit(this.createFile)(data);
        }}
      >
        <div className="new-file-form-container">
          <label className="new-file-form__name-label" htmlFor="name">Name:</label>
          <input
            className="new-file-form__name-input"
            id="name"
            type="text"
            placeholder="Name"
            {...domOnlyProps(name)}
            ref={(element) => { this.fileName = element; }}
          />
          <input type="submit" value="Add File" aria-label="add file" />
          {name.touched && name.error && <span className="form-error">{name.error}</span>}
        </div>
        <ul className="new-file-form-extensions-container">
          {FILE_EXTENSIONS.map(fileExtension => (
            <li>
              <button
                onClick={() => this.appendFileExtension(fileExtension)}
                className={`${this.isCurrentExtension(fileExtension) ? 'new-file-form-extensions--active' : ''}`}
              >
                {fileExtension}
              </button>
            </li>
          ))}
        </ul>
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
