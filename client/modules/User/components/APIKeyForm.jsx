import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import format from 'date-fns/format';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import orderBy from 'lodash/orderBy';

const trashCan = require('../../../images/trash-can.svg');

function NewTokenDisplay({ token }) {
  return (
    <React.Fragment>
      <p>Make sure to copy your new personal access token now. You won’t be able to see it again!</p>
      <p><input type="text" readOnly value={token} /></p>
      <button>Copy</button>
    </React.Fragment>
  );
}

function TokenMetadataList({ tokens, onRemove }) {
  return (
    <table className="form__table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Created on</th>
          <th>Last used</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orderBy(tokens, ['createdAt'], ['desc']).map((v) => {
          const keyRow = (
            <tr key={v.id}>
              <td>{v.label}</td>
              <td>{format(new Date(v.createdAt), 'MMM D, YYYY h:mm A')}</td>
              <td>{distanceInWordsToNow(new Date(v.lastUsedAt), { addSuffix: true })}</td>
              <td>
                <button className="account__tokens__delete-button" onClick={() => onRemove(v)}>
                  <InlineSVG src={trashCan} alt="Delete Key" />
                </button>
              </td>
            </tr>
          );

          const newKeyValue = v.token && (
            <tr key={`${v.id}-newKey`}>
              <td colSpan="4">
                <NewTokenDisplay token={v.token} />
              </td>
            </tr>
          );

          return [keyRow, newKeyValue];
        })}
      </tbody>
    </table>
  );
}

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
        <TokenMetadataList tokens={this.props.apiKeys} onRemove={this.removeKey} />
      );
    }
    return <p>You have no API keys</p>;
  }

  render() {
    return (
      <div>
        <form id="addKeyForm" className="form" onSubmit={this.addKey}>
          <label htmlFor="keyLabel" className="form__label">Name</label>
          <input
            type="text"
            className="form__input"
            placeholder="What is this token for?"
            id="keyLabel"
            onChange={(event) => { this.setState({ keyLabel: event.target.value }); }}
          />
          <input
            type="submit"
            value="Create new Key"
            disabled={this.state.keyLabel === ''}
          />
        </form>
        {this.renderApiKeys()}
      </div>
    );
  }
}

APIKeyForm.propTypes = {
  createApiKey: PropTypes.func.isRequired,
  removeApiKey: PropTypes.func.isRequired,
  apiKeys: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    createdAt: PropTypes.object.isRequired,
    lastUsedAt: PropTypes.object.isRequired,
  })).isRequired
};

export default APIKeyForm;
