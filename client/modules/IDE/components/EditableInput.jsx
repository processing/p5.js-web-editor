import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import EditIcon from '../../../images/pencil.svg';

// TODO I think this needs a description prop so that it's accessible
function EditableInput({
  validate,
  value,
  emptyPlaceholder,
  InputComponent,
  inputProps,
  onChange,
  disabled,
  'aria-label': ariaLabel
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value || '');
  const displayValue = currentValue || emptyPlaceholder;
  const hasValue = currentValue !== '';
  const classes = `editable-input editable-input--${
    isEditing ? 'is-editing' : 'is-not-editing'
  } editable-input--${hasValue ? 'has-value' : 'has-placeholder'} ${
    disabled ? 'editable-input--disabled' : ''
  }`;
  const inputRef = React.useRef();
  const { t } = useTranslation();
  React.useEffect(() => {
    if (isEditing) {
      const inputElement = inputRef.current;
      inputElement.setSelectionRange(
        inputElement.value.length,
        inputElement.value.length
      );
      inputElement.focus();
    }
  }, [isEditing]);
  React.useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  function beginEditing() {
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setCurrentValue(value);
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
    } else if (event.key === 'Escape' || event.key === 'Esc') {
      cancelEditing();
    }
  }

  return (
    <span className={classes}>
      <button
        className="editable-input__label"
        onClick={beginEditing}
        aria-label={
          ariaLabel ?? t('EditableInput.EditValue', { display: displayValue })
        }
        aria-hidden={isEditing}
        disabled={disabled}
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
        aria-hidden={!isEditing}
        onBlur={doneEditing}
        onChange={updateValue}
        onKeyDown={checkForKeyAction}
        ref={inputRef}
        value={currentValue}
      />
    </span>
  );
}

EditableInput.defaultProps = {
  emptyPlaceholder: i18next.t('EditableInput.EmptyPlaceholder'),
  InputComponent: 'input',
  inputProps: {},
  validate: () => true,
  value: '',
  disabled: false,
  'aria-label': undefined
};

EditableInput.propTypes = {
  emptyPlaceholder: PropTypes.string,
  InputComponent: PropTypes.elementType,
  // eslint-disable-next-line react/forbid-prop-types
  inputProps: PropTypes.object, // eslint-disable-line
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  'aria-label': PropTypes.string
};

export default EditableInput;
