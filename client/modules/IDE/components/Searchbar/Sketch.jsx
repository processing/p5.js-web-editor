import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import i18next from 'i18next';
import * as SearchingActions from '../../actions/search';

import Searchbar from './Searchbar';

const scope = 'sketch';

function mapStateToProps(state) {
  return {
    searchLabel: i18next.t('Searchbar.SearchSketch'),
    searchTerm: state.search[`${scope}SearchTerm`]
  };
}

function mapDispatchToProps(dispatch) {
  const actions = {
    setSearchTerm: (term) => SearchingActions.setSearchTerm(scope, term),
    resetSearchTerm: () => SearchingActions.resetSearchTerm(scope)
  };
  return bindActionCreators(Object.assign({}, actions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Searchbar);
