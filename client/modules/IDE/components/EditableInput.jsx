import PropTypes from 'prop-types';
import React from 'react';

import EditIcon from '../../../images/pencil.svg';

// TODO I think this needs a description prop so that it's accessible
function EditableInput({
  validate,
  value,
  emptyPlaceholder,
  InputComponent,
  inputProps,
  onChange,
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value || '');
  const displayValue = currentValue || emptyPlaceholder;
  const hasValue = currentValue !== '';
  const classes = `editable-input editable-input--${
    isEditing ? 'is-editing' : 'is-not-editing'
  } editable-input--${hasValue ? 'has-value' : 'has-placeholder'}`;
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
      <button
        className="editable-input__label"
        onClick={beginEditing}
        aria-label={`Edit ${displayValue} value`}
      >
        <span>{displayValue}</span>
        <EditIcon
          className="editable-input__icon"
          focusable="false"
          aria-hidden="true"
        />
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
    </span>
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
  inputProps: PropTypes.object, // eslint-disable-line
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  value: PropTypes.string,
};

export default EditableInput;
