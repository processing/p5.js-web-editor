import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';
import { textFileExtensionsArray, TEXT_FILE_REGEX } from '../../../../server/utils/fileUtils';

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
    let { fields: { name: { value: fileName } } } = this.props;
    const { setFieldValue } = this.props;
    if (TEXT_FILE_REGEX.test(fileName)) {
      fileName = fileName.substr(0, fileName.lastIndexOf('.'));
    }
    setFieldValue('name', `${fileName}.${fileExtension}`);
  }

  isCurrentExtension(fileExtension) {
    const { fields: { name: { value: fileName } } } = this.props;
    const fileExtensionMatch = TEXT_FILE_REGEX.exec(fileName);
    const currentFileExtension = fileExtensionMatch ? fileExtensionMatch[1] : '';
    return fileExtension === currentFileExtension;
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
          {textFileExtensionsArray.map(fileExtension => (
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
  focusOnModal: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired
};

export default NewFileForm;
