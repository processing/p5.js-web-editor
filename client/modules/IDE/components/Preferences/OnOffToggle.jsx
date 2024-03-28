import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const OnOffToggle = ({ value, setValue, name, translationKey, children }) => {
  const { t } = useTranslation();

  return (
    <div className="preference__options">
      <input
        type="radio"
        onChange={() => setValue(true)}
        aria-label={t(`Preferences.${translationKey}OnARIA`)}
        name={name}
        id={`${name}-on`}
        className="preference__radio-button"
        value="On"
        checked={value}
      />
      <label htmlFor={`${name}-on`} className="preference__option">
        {t('Preferences.On')}
      </label>
      <input
        type="radio"
        onChange={() => setValue(false)}
        aria-label={t(`Preferences.${translationKey}OffARIA`)}
        name={name}
        id={`${name}-off`}
        className="preference__radio-button"
        value="Off"
        checked={!value}
      />
      <label htmlFor={`${name}-off`} className="preference__option">
        {t('Preferences.Off')}
      </label>
      {children}
    </div>
  );
};

OnOffToggle.propTypes = {
  /**
   * `true` if turned on, `false` if off.
   */
  value: PropTypes.bool.isRequired,
  /**
   * Function to call when the value is changed.
   * Will receive the new `boolean` value.
   */
  setValue: PropTypes.func.isRequired,
  /**
   * Used as the HTML `name` attribute of the form elements,
   * and also used to formulate the `id`s.
   */
  name: PropTypes.string.isRequired,
  /**
   * Common prefix for looking up the "On" and "Off" ARIA labels.
   * If the ARIA label is t('Preferences.LintWarningOnARIA'),
   * then the `translationKey` is `LintWarning`.
   */
  translationKey: PropTypes.string,
  /**
   * Can insert additional elements in the same <div> as the inputs.
   * Typically not used.
   */
  children: PropTypes.node
};

OnOffToggle.defaultProps = {
  translationKey: '',
  children: null
};

export default OnOffToggle;
