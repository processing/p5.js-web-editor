import PropTypes from 'prop-types';
import React from 'react';

class APIKeyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { keyLabel: '' };

    this.addKey = this.addKey.bind(this);
  }

  addKey(event) {
    // TODO
    console.log('addKey');
    this.props.updateSettings();
    event.preventDefault();
    return false;
  }

  removeKey(k) {
    // TODO
    console.log(k);
  }

  render() {
    return (
      <div>
        <h2 className="form__label">Key label</h2>
        <form className="form" onSubmit={this.addKey}>
          <input
            type="text"
            className="form__input"
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
            {[{
              id: 1,
              label: 'MyFirstAPI',
              createdAt: new Date(),
              lastUsedAt: new Date()
            }, {
              id: 2,
              label: 'MyOtherAPI',
              createdAt: new Date(),
              lastUsedAt: new Date()
            }].map(v => (
              <tr key={v.id}>
                <td><b>{v.label}</b><br />Created on: {v.createdAt.toLocaleDateString()} {v.createdAt.toLocaleTimeString()}</td>
                <td>Last used on:<br /> {v.lastUsedAt.toLocaleDateString()} {v.lastUsedAt.toLocaleTimeString()}</td>
                <td><button className="form__button-remove" onClick={() => this.removeKey(v)}>Delete</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
    );
  }
}

APIKeyForm.propTypes = {
  updateSettings: PropTypes.func.isRequired,
};

export default APIKeyForm;
