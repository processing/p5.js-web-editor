import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CollectionsActions from '../../IDE/actions/collections';

import { generateCollectionName } from '../../../utils/generateRandomName';
import Button from '../../../common/Button';

class CollectionCreate extends React.Component {
  constructor() {
    super();

    const name = generateCollectionName();

    this.state = {
      generatedCollectionName: name,
      collection: {
        name,
        description: ''
      }
    };
  }

  getTitle() {
    return 'p5.js Web Editor | Create collection';
  }

  handleTextChange = field => (evt) => {
    this.setState({
      collection: {
        ...this.state.collection,
        [field]: evt.target.value,
      }
    });
  }

  handleCreateCollection = (event) => {
    event.preventDefault();

    this.props.createCollection(this.state.collection);
  }

  render() {
    const { generatedCollectionName, creationError } = this.state;
    const { name, description } = this.state.collection;

    const invalid = name === '' || name == null;

    return (
      <div className="collection-create">
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        <div className="sketches-table-container">
          <form className="form" onSubmit={this.handleCreateCollection}>
            {creationError && <span className="form-error">Couldn&apos;t create collection</span>}
            <p className="form__field">
              <label htmlFor="name" className="form__label">Collection name</label>
              <input
                className="form__input"
                aria-label="name"
                type="text"
                id="name"
                value={name}
                placeholder={generatedCollectionName}
                onChange={this.handleTextChange('name')}
              />
              {invalid && <span className="form-error">Collection name is required</span>}
            </p>
            <p className="form__field">
              <label htmlFor="description" className="form__label">Description (optional)</label>
              <textarea
                className="form__input form__input-flexible-height"
                aria-label="description"
                type="text"
                id="description"
                value={description}
                onChange={this.handleTextChange('description')}
                placeholder="My fave sketches"
                rows="4"
              />
            </p>
            <Button type="submit" disabled={invalid}>Create collection</Button>
          </form>
        </div>
      </div>
    );
  }
}

CollectionCreate.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  createCollection: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, CollectionsActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionCreate);
