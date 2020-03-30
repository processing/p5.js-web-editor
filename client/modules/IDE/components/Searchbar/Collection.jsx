import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SortingActions from '../../actions/sorting';

import Searchbar from './Searchbar';

const scope = 'collection';

function mapStateToProps(state) {
  return {
    searchLabel: 'Search collections...',
    searchTerm: state.search[`${scope}SearchTerm`],
  };
}

function mapDispatchToProps(dispatch) {
  const actions = {
    setSearchTerm: term => SortingActions.setSearchTerm(scope, term),
    resetSearchTerm: () => SortingActions.resetSearchTerm(scope),
  };
  return bindActionCreators(Object.assign({}, actions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Searchbar);
