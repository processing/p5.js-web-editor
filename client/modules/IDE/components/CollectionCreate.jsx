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

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');

class CollectionCreate extends React.Component {
  state = {
    collection: {
      name: 'My collection name',
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

  handleCreateCollection = () => {
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

  _renderCollectionMetadata() {
    return (
      <div className="collections-metadata">
        <p><input type="text" value={this.state.collection.description} placeholder="This is a collection of..." onChange={this.handleTextChange('description')} /></p>
      </div>
    );
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;

    return (
      <Overlay
        ariaLabel="collection"
        title={<input type="text" value={this.state.collection.name} onChange={this.handleTextChange('name')} />}
        previousPath={this.props.previousPath}
      >
        <div className="sketches-table-container">
          <Helmet>
            <title>{this.getTitle()}</title>
          </Helmet>
          {this._renderCollectionMetadata()}
          <button onClick={this.handleCreateCollection}>Add collection</button>
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
