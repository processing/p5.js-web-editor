import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addLibraryRequest } from '../actions/libraries';

const LIBRARY = {
  name: 'ml5.js',
  url: 'https://unpkg.com/ml5@0.2.3/dist/ml5.min.js'
};

class LibraryManager extends React.Component {
  static propTypes = {
    addLibraryRequest: PropTypes.func.isRequired,
    libraries: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })).isRequired
  }

  handleButtonClick = () => {
    const { name, url } = LIBRARY;
    this.props.addLibraryRequest(name, url);
  }

  render() {
    const { libraries } = this.props;
    return (
      <div className="library-manager">
        <span className="library-title">Libraries</span>
        <ul>
          {libraries.map(library => (
            <li className="library-item" key={library.name}>
              {library.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    libraries: state.libraries
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addLibraryRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryManager);
