import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../../common/Button';
import { PlusIcon } from '../../../common/icons';
import CopyableInput from '../../IDE/components/CopyableInput';

import APIKeyList from './APIKeyList';

export const APIKeyPropType = PropTypes.shape({
  id: PropTypes.object.isRequired, // eslint-disable-line
  token: PropTypes.object, // eslint-disable-line
  label: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  lastUsedAt: PropTypes.string,
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
      keyLabel: ''
    });

    this.props.createApiKey(keyLabel);

    return false;
  }

  removeKey(key) {
    const message = `Are you sure you want to delete "${key.label}"?`;

    if (window.confirm(message)) {
      this.props.removeApiKey(key.id);
    }
  }

  renderApiKeys() {
    const hasApiKeys = this.props.apiKeys && this.props.apiKeys.length > 0;

    if (hasApiKeys) {
      return (
        <APIKeyList apiKeys={this.props.apiKeys} onRemove={this.removeKey} />
      );
    }
    return <p>You have no exsiting tokens.</p>;
  }

  render() {
    const keyWithToken = this.props.apiKeys.find(k => !!k.token);

    return (
      <div className="api-key-form">
        <p className="api-key-form__summary">
          Personal Access Tokens act like your password to allow automated
          scripts to access the Editor API. Create a token for each script
          that needs access.
        </p>

        <div className="api-key-form__section">
          <h3 className="api-key-form__title">Create new token</h3>
          <form className="form form--inline" onSubmit={this.addKey}>
            <label htmlFor="keyLabel" className="form__label form__label--hidden ">What is this token for?</label>
            <input
              className="form__input"
              id="keyLabel"
              onChange={(event) => { this.setState({ keyLabel: event.target.value }); }}
              placeholder="What is this token for? e.g. Example import script"
              type="text"
              value={this.state.keyLabel}
            />
            <Button
              disabled={this.state.keyLabel === ''}
              iconBefore={<PlusIcon />}
              label="Create new key"
              type="submit"
            >
              Create
            </Button>
          </form>

          {
            keyWithToken && (
              <div className="api-key-form__new-token">
                <h4 className="api-key-form__new-token__title">Your new access token</h4>
                <p className="api-key-form__new-token__info">
                  Make sure to copy your new personal access token now.
                  You won’t be able to see it again!
                </p>
                <CopyableInput label={keyWithToken.label} value={keyWithToken.token} />
              </div>
            )
          }
        </div>

        <div className="api-key-form__section">
          <h3 className="api-key-form__title">Existing tokens</h3>
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
};

export default APIKeyForm;
