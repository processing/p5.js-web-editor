import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as CollectionsActions from '../../actions/collections';
import getSortedCollections from '../../selectors/collections';

import exitUrl from '../../../../images/exit.svg';

import Loader from '../../../App/components/loader';
import { Searchbar } from '../Searchbar';
import Item from './Item';

const NoCollections = () => (
  <div className="collection-popover__empty">
    <p>No collections</p>
  </div>);

const projectInCollection = (project, collection) => (
  collection.items.find(item => item.project.id === project.id) != null
);


const CollectionPopover = ({
  loading, onClose, project, collections, addToCollection, removeFromCollection, getCollections, user
}) => {
  const [didLoadData, setDidLoadData] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredCollections = searchTerm === '' ?
    collections :
    collections.filter(({ name }) => name.toUpperCase().includes(searchTerm.toUpperCase()));

  React.useEffect(() => {
    getCollections(user.username);
  }, [user]);

  React.useEffect(() => {
    if (didLoadData === true) {
      return;
    }

    if (loading && didLoadData === null) {
      setDidLoadData(false);
    } else if (!loading && didLoadData === false) {
      setDidLoadData(true);
    }
  }, [loading]);

  const handleAddToCollection = (collectionId) => {
    addToCollection(collectionId, project.id);
  };

  const handleRemoveFromCollection = (collectionId) => {
    removeFromCollection(collectionId, project.id);
  };

  let content = null;

  if (didLoadData && collections.length === 0) {
    content = <NoCollections />;
  } else if (didLoadData) {
    content = (
      <ul>
        {
          filteredCollections.map((collection) => {
            const inCollection = projectInCollection(project, collection);
            const handleSelect = inCollection ? handleRemoveFromCollection : handleAddToCollection;

            return (
              <Item inCollection={inCollection} key={collection.id} collection={collection} onSelect={() => handleSelect(collection.id)} />
            );
          })
        }
      </ul>
    );
  } else {
    content = <Loader />;
  }

  return (
    <div className="collection-popover">
      <div className="collection-popover__header">
        <h4>Add to collection</h4>
        <button className="collection-popover__exit-button" onClick={onClose}>
          <InlineSVG src={exitUrl} alt="Close Add to Collection" />
        </button>
      </div>

      <div className="collection-popover__filter">
        <Searchbar searchLabel="Search collections..." searchTerm={searchTerm} setSearchTerm={setSearchTerm} resetSearchTerm={() => setSearchTerm('')} />
      </div>

      <div className="collection-popover__items">
        {content}
      </div>
    </div>
  );
};

CollectionPopover.propTypes = {
  loading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  getCollections: PropTypes.func.isRequired,
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  collections: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    collections: getSortedCollections(state),
    loading: state.loading,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionsActions),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionPopover);
