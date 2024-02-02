import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../common/Button';
import { PlusIcon } from '../../../common/icons';
import CopyableInput from '../../IDE/components/CopyableInput';
import { createApiKey, removeApiKey } from '../actions';

import APIKeyList from './APIKeyList';

export const APIKeyPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  token: PropTypes.string,
  label: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  lastUsedAt: PropTypes.string
});

const APIKeyForm = () => {
  const { t } = useTranslation();
  const apiKeys = useSelector((state) => state.user.apiKeys);
  const dispatch = useDispatch();

  const [keyLabel, setKeyLabel] = useState('');

  const addKey = (event) => {
    event.preventDefault();
    dispatch(createApiKey(keyLabel));
    setKeyLabel('');
  };

  const removeKey = (key) => {
    const message = t('APIKeyForm.ConfirmDelete', {
      key_label: key.label
    });

    if (window.confirm(message)) {
      dispatch(removeApiKey(key.id));
    }
  };

  const renderApiKeys = () => {
    const hasApiKeys = apiKeys && apiKeys.length > 0;

    if (hasApiKeys) {
      return <APIKeyList apiKeys={apiKeys} onRemove={removeKey} />;
    }
    return <p>{t('APIKeyForm.NoTokens')}</p>;
  };

  const keyWithToken = apiKeys.find((k) => !!k.token);

  return (
    <div className="api-key-form">
      <p className="api-key-form__summary">{t('APIKeyForm.Summary')}</p>

      <div className="api-key-form__section">
        <h3 className="api-key-form__title">{t('APIKeyForm.CreateToken')}</h3>
        <form className="form form--inline" onSubmit={addKey}>
          <label
            htmlFor="keyLabel"
            className="form__label form__label--hidden "
          >
            {t('APIKeyForm.TokenLabel')}
          </label>
          <input
            className="form__input"
            id="keyLabel"
            onChange={(event) => {
              setKeyLabel(event.target.value);
            }}
            placeholder={t('APIKeyForm.TokenPlaceholder')}
            type="text"
            value={keyLabel}
          />
          <Button
            disabled={keyLabel === ''}
            iconBefore={<PlusIcon />}
            label="Create new key"
            type="submit"
          >
            {t('APIKeyForm.CreateTokenSubmit')}
          </Button>
        </form>

        {keyWithToken && (
          <div className="api-key-form__new-token">
            <h4 className="api-key-form__new-token__title">
              {t('APIKeyForm.NewTokenTitle')}
            </h4>
            <p className="api-key-form__new-token__info">
              {t('APIKeyForm.NewTokenInfo')}
            </p>
            <CopyableInput
              label={keyWithToken.label}
              value={keyWithToken.token}
            />
          </div>
        )}
      </div>

      <div className="api-key-form__section">
        <h3 className="api-key-form__title">
          {t('APIKeyForm.ExistingTokensTitle')}
        </h3>
        {renderApiKeys()}
      </div>
    </div>
  );
};

export default APIKeyForm;
