import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import * as IdeActions from '../actions/ide';
import { getCollection } from '../selectors/collections';
import Loader from '../../App/components/loader';
import Overlay from '../../App/components/Overlay';

import { generateCollectionName } from '../../../utils/generateRandomName';

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');

class CollectionCreate extends React.Component {
  state = {
    collection: {
      name: generateCollectionName(),
      description: ''
    }
  }

  getTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My collections';
    }
    return `p5.js Web Editor | ${this.props.username}'s collections`;
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

    this.props.createCollection(this.state.collection)
      .then(({ id, owner }) => {
        // Redirect to collection URL
        console.log('Done, will redirect to collection');
        browserHistory.replace(`/${owner.username}/collections/${id}`);
      })
      .catch((error) => {
        console.error('Error creating collection', error);
      });
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;

    const { name, description } = this.state.collection;

    const invalid = name === '' || name == null;

    return (
      <Overlay
        ariaLabel="collection"
        title="Create a collection"
        previousPath={this.props.previousPath}
      >
        <div className="sketches-table-container">
          <Helmet>
            <title>{this.getTitle()}</title>
          </Helmet>
          <form className="form" onSubmit={this.handleCreateCollection}>
            <p className="form__field">
              <label htmlFor="name" className="form__label">Name</label>
              <input
                className="form__input"
                aria-label="name"
                type="text"
                id="name"
                value={this.state.collection.name}
                onChange={this.handleTextChange('description')}
              />
            </p>
            <p className="form__field">
              <label htmlFor="description" className="form__label">What is this collection about?</label>
              <textarea
                className="form__input"
                aria-label="description"
                type="text"
                id="description"
                value={this.state.collection.description}
                onChange={this.handleTextChange('description')}
                placeholder="My fave sketches"
                rows="4"
              />
            </p>
            <input type="submit" disabled={invalid} value="Create collection" aria-label="create collection" />
          </form>
        </div>
      </Overlay>
    );
  }
}

CollectionCreate.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getCollections: PropTypes.func.isRequired,
  collection: PropTypes.shape({}).isRequired, // TODO
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired
};

CollectionCreate.defaultProps = {
  username: undefined
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, CollectionsActions, ProjectsActions, ToastActions, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionCreate);
