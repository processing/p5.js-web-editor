import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import styled from 'styled-components';
import { remSize, prop } from '../../../theme';
import EditIcon from '../../../images/pencil.svg';

const EditableInputWrapper = styled.span`
  height: 70%;
  display: flex;
  align-items: center;
`;
const EditableInputLabel = styled.button`
  display: ${(props) => (props.isEditing ? 'none' : 'flex')};
  color: ${prop('Text.inactive')};
  cursor: pointer;
  line-height: ${remSize(18)};
  font-size: unset;
  font-weight: unset;
  & path {
    fill: ${prop('Text.inactive')};
  }
  &:hover {
    color: ${prop('Logo.color')} !important;
    & path {
      fill: ${prop('Logo.color')} !important;
    }
  }
`;
const EditableInputValue = styled.span``;
const EditableInputIcon = styled(EditIcon)`
  width: 1.5rem;
  height: 1.5rem;
`;

// TODO I think this needs a description prop so that it's accessible
function EditableInput({
  validate,
  value,
  emptyPlaceholder,
  InputComponent,
  inputProps,
  onChange
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value || '');
  const displayValue = currentValue || emptyPlaceholder;
  const inputRef = React.createRef();
  const { t } = useTranslation();
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
    <EditableInputWrapper>
      <EditableInputLabel
        onClick={beginEditing}
        aria-label={t('EditableInput.EditValue', { display: displayValue })}
        isEditing={isEditing}
      >
        <EditableInputValue>{displayValue}</EditableInputValue>
        <EditableInputIcon focusable="false" aria-hidden="true" />
      </EditableInputLabel>

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
        style={{ width: '100%', display: isEditing ? 'flex' : 'none' }}
      />
    </EditableInputWrapper>
  );
}

EditableInput.defaultProps = {
  emptyPlaceholder: i18next.t('EditableInput.EmptyPlaceholder'),
  InputComponent: 'input',
  inputProps: {},
  validate: () => true,
  value: ''
};

EditableInput.propTypes = {
  emptyPlaceholder: PropTypes.string,
  InputComponent: PropTypes.elementType,
  // eslint-disable-next-line react/forbid-prop-types
  inputProps: PropTypes.object, // eslint-disable-line
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  value: PropTypes.string
};

export default EditableInput;
