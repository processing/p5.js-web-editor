import PropTypes from 'prop-types';
import React from 'react';

class APIKeyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { keyLabel: '' };

    this.addKey = this.addKey.bind(this);
  }

  addKey(event) {
    event.preventDefault();
    document.getElementById('addKeyForm').reset();
    this.props.createApiKey(this.state.keyLabel)
      .then(newToken => this.setState({ newToken }));
    this.state.keyLabel = '';
    return false;
  }

  removeKey(keyId) {
    this.props.removeApiKey(keyId);
  }

  render() {
    const { newToken } = this.state;

    const content = newToken ?
      (
        <div>
          <p>Here is your new key. Copy it somewhere, you won't be able to see it later !</p>
          <input type="text" readOnly value={newToken} />
          <button>Copy to clipboard</button>
        </div>) :
      (<form id="addKeyForm" className="form" onSubmit={this.addKey}>
        <h2 className="form__label">Key label</h2>
        <input
          type="text"
          className="form__input"
          placeholder="A name you will be able to recognize"
          id="keyLabel"
          onChange={(event) => { this.setState({ keyLabel: event.target.value }); }}
        /><br />
        <input
          type="submit"
          value="Create new Key"
          disabled={this.state.keyLabel === ''}
        />
        </form>
      );

    return (
      <div>
        {content}
        <table className="form__table">
          <tbody id="form__table_new_key"></tbody>
          <tbody>
            {this.props.apiKeys && this.props.apiKeys.map(v => (
              <tr key={v.id}>
                <td><b>{v.label}</b><br />Created on: {v.createdAt}</td>
                <td>Last used on:<br /> {v.lastUsedAt}</td>
                <td><button className="form__table-button-remove" onClick={() => this.removeKey(v.id)}>Delete</button></td>
              </tr>))}
          </tbody>
        </table>
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
