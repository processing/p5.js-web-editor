import PropTypes from 'prop-types';
import React from 'react';

function FormField({ id, label, ariaLabel, hasError, error, ...rest }) {
  return (
    <p className="form__field">
      <label htmlFor={id} className="form__label">
        {label}
      </label>
      <input className="form__input" aria-label={ariaLabel} id={id} {...rest} />
      {hasError && <span className="form-error">{error}</span>}
    </p>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
  hasError: PropTypes.bool,
  error: PropTypes.string
};

FormField.defaultProps = {
  autoComplete: null,
  hasError: false,
  error: null
};

export default FormField;
