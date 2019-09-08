import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';

const editIconUrl = require('../../../images/pencil.svg');

function EditIcon() {
  return <InlineSVG className="editable-input__icon" src={editIconUrl} alt="Edit" />;
}

function EditableInput({
  validate, value, emptyPlaceholder, InputComponent, inputProps, onChange
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value || '');
  const displayValue = currentValue || emptyPlaceholder;
  const classes = `editable-input editable-input--${isEditing ? 'is-editing' : 'is-not-editing'}`;
  const inputRef = React.createRef();

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  function beginEditing() {
    setIsEditing(true);
  }

  function doneEditing() {
    setIsEditing(false);

    const isValid = typeof validate === 'function' && validate(currentValue);

    if (isValid) {
      onChange(currentValue);
    } else {
      setCurrentValue(value);
    }
  }

  function updateValue(event) {
    setCurrentValue(event.target.value);
  }

  function checkForKeyAction(event) {
    if (event.key === 'Enter') {
      doneEditing();
    }
  }

  return (
    <span className={classes}>
      <button className="editable-input__label" onClick={beginEditing}>
        <span>{displayValue}</span>
        <EditIcon />
      </button>

      <InputComponent
        className="editable-input__input"
        type="text"
        {...inputProps}
        disabled={!isEditing}
        onBlur={doneEditing}
        onChange={updateValue}
        onKeyPress={checkForKeyAction}
        ref={inputRef}
        value={currentValue}
      />
    </span >
  );
}

EditableInput.defaultProps = {
  emptyPlaceholder: 'No value',
  InputComponent: 'input',
  inputProps: {},
  validate: () => true,
  value: '',
};

EditableInput.propTypes = {
  emptyPlaceholder: PropTypes.string,
  InputComponent: PropTypes.elementType,
  // eslint-disable-next-line react/forbid-prop-types
  inputProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  value: PropTypes.string,
};

export default EditableInput;
