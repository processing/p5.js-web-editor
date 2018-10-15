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
    this.props.addApiKey(this.state.keyLabel);
    return false;
  }

  removeKey(keyId) {
    this.props.removeApiKey(keyId);
  }

  render() {
    return (
      <div>
        <h2 className="form__label">Key label</h2>
        <form id="addKeyForm" className="form" onSubmit={this.addKey}>
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
        <table className="form__table">
          <tbody>
            {this.props.apiKeys && this.props.apiKeys.map(v => (
              <tr key={v.id}>
                <td><b>{v.label}</b><br />Created on: {v.createdAt}</td>
                <td>Last used on:<br /> {v.lastUsedAt}</td>
                <td><button className="form__button-remove" onClick={() => this.removeKey(v.id)}>Delete</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
    );
  }
}

APIKeyForm.propTypes = {
  addApiKey: PropTypes.func.isRequired,
  removeApiKey: PropTypes.func.isRequired,
  apiKeys: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    createdAt: PropTypes.object.isRequired,
    lastUsedAt: PropTypes.object.isRequired,
  })).isRequired
};

export default APIKeyForm;
