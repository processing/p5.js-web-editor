import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as CollectionsActions from '../../actions/collections';
import getSortedCollections from '../../selectors/collections';

// import { Link } from 'react-router';

import exitUrl from '../../../../images/exit.svg';

import { Searchbar } from '../Searchbar';
import Item from './Item';

// const reducer = () => {
//   switch ()
//   case 'noItems':
//     return 'NoCollections';
//   case
// }

const NoCollections = () => (
  <div>
    <p>No collections</p>
    {/* <p>
      <Link
        to="/andrewn/collections/create"
        className="searchbar__clear-button"
        onClick={() => {}}
      >Create
      </Link>
    </p> */}
  </div>);


const CollectionPopover = ({
  onClose, project, collections, addToCollection, getCollections, user
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    getCollections(user.username);
  }, [user]);

  const handleAddToCollection = (collectionId) => {
    addToCollection(collectionId, project.id);
  };

  return (
    <div className="collection-popover">
      <div className="collection-popover__header">
        <h4>Add to collection</h4>
        <button className="collection-popover__exit-button" onClick={onClose}>
          <InlineSVG src={exitUrl} alt="Close Add to Collection" />
        </button>
      </div>

      <div className="collection-popover__filter">
        <Searchbar searchLabel="Search collections..." searchTerm={searchTerm} setSearchTerm={setSearchTerm} resetSearchTerm={setSearchTerm} />
      </div>

      <div className="collection-popover__items">
        <ul>
          {
            collections.map(collection => <Item key={collection.id} collection={collection} onSelect={() => handleAddToCollection(collection.id)} />)
          }
        </ul>
      </div>
    </div>
  );
};

CollectionPopover.propTypes = {
  onClose: PropTypes.func.isRequired,
  getCollections: PropTypes.func.isRequired,
  addToCollection: PropTypes.func.isRequired,
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
