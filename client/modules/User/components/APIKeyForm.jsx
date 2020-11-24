import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../../common/Button';
import { PlusIcon } from '../../../common/icons';
import CopyableInput from '../../IDE/components/CopyableInput';

import APIKeyList from './APIKeyList';

export const APIKeyPropType = PropTypes.shape({
  id: PropTypes.objectOf(PropTypes.shape()),
  token: PropTypes.objectOf(PropTypes.shape()),
  label: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  lastUsedAt: PropTypes.string
});

class APIKeyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { keyLabel: '' };

    this.addKey = this.addKey.bind(this);
    this.removeKey = this.removeKey.bind(this);
    this.renderApiKeys = this.renderApiKeys.bind(this);
  }

  addKey(event) {
    event.preventDefault();
    const { keyLabel } = this.state;

    this.setState({
      keyLabel: '',
    });

    this.props.createApiKey(keyLabel);

    return false;
  }

  removeKey(key) {
    const message = this.props.t('APIKeyForm.ConfirmDelete', { key_label: key.label });

    if (window.confirm(message)) {
      this.props.removeApiKey(key.id);
    }
  }

  renderApiKeys() {
    const hasApiKeys = this.props.apiKeys && this.props.apiKeys.length > 0;

    if (hasApiKeys) {
      return (
        <APIKeyList apiKeys={this.props.apiKeys} onRemove={this.removeKey} t={this.props.t} />
      );
    }
    return <p>{this.props.t('APIKeyForm.NoTokens')}</p>;
  }

  render() {
    const keyWithToken = this.props.apiKeys.find(k => !!k.token);

    return (
      <div className="api-key-form">
        <p className="api-key-form__summary">
          {this.props.t('APIKeyForm.Summary')}
        </p>

        <div className="api-key-form__section">
          <h3 className="api-key-form__title">{this.props.t('APIKeyForm.CreateToken')}</h3>
          <form className="form form--inline" onSubmit={this.addKey}>
            <label htmlFor="keyLabel" className="form__label form__label--hidden ">{this.props.t('APIKeyForm.TokenLabel')}</label>
            <input
              className="form__input"
              id="keyLabel"
              onChange={(event) => { this.setState({ keyLabel: event.target.value }); }}
              placeholder={this.props.t('APIKeyForm.TokenPlaceholder')}
              type="text"
              value={this.state.keyLabel}
            />
            <Button
              disabled={this.state.keyLabel === ''}
              iconBefore={<PlusIcon />}
              label="Create new key"
              type="submit"
            >
              {this.props.t('APIKeyForm.CreateTokenSubmit')}
            </Button>
          </form>

          {
            keyWithToken && (
              <div className="api-key-form__new-token">
                <h4 className="api-key-form__new-token__title">{this.props.t('APIKeyForm.NewTokenTitle')}</h4>
                <p className="api-key-form__new-token__info">
                  {this.props.t('APIKeyForm.NewTokenInfo')}
                </p>
                <CopyableInput label={keyWithToken.label} value={keyWithToken.token} />
              </div>
            )
          }
        </div>

        <div className="api-key-form__section">
          <h3 className="api-key-form__title">{this.props.t('APIKeyForm.ExistingTokensTitle')}</h3>
          {this.renderApiKeys()}
        </div>
      </div>
    );
  }
}

APIKeyForm.propTypes = {
  apiKeys: PropTypes.arrayOf(PropTypes.shape(APIKeyPropType)).isRequired,
  createApiKey: PropTypes.func.isRequired,
  removeApiKey: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default APIKeyForm;
