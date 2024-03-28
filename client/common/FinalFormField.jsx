import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'react-final-form';
import FormField from './FormField';

function FinalFormField({
  name,
  validate,
  validateFields,
  initialValue,
  ...rest
}) {
  return (
    <Field
      name={name}
      validate={validate}
      validateFields={validateFields}
      initialValue={initialValue}
    >
      {(field) => (
        <FormField
          {...rest}
          {...field.input}
          hasError={field.meta.touched && !!field.meta.error}
          error={field.meta.error}
        />
      )}
    </Field>
  );
}

FinalFormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
  name: PropTypes.string.isRequired,
  validate: PropTypes.func,
  validateFields: PropTypes.arrayOf(PropTypes.string),
  initialValue: PropTypes.string
};

FinalFormField.defaultProps = {
  autoComplete: undefined,
  validate: undefined,
  validateFields: undefined,
  initialValue: ''
};

export default FinalFormField;
