import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ProjectsActions from '../actions/projects';
import Table from './Table';
import SketchListRow from './SketchList';
import Overlay from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import SearchBar from './Searchbar/SearchBar';

class SketchTable extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);

    this.state = {
      sketchToAddToCollection: null
    };
  }
  render() {
    const SketchListHeaderRow = [
      { field: 'name', name: 'SketchList.HeaderName' },
      { field: 'createdAt', name: 'SketchList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'SketchList.HeaderUpdatedAt' }
    ];
    const {
      username,
      sketches,
      searchTerm,
      mobile,
      user,
      project,
      t
    } = this.props;
    const sketchTableRows = sketches.map((sketch) => ({
      ...sketch,
      row: (
        <SketchListRow
          mobile={mobile}
          key={sketch.id}
          sketch={sketch}
          user={user}
          username={username}
          project={project}
          onAddToCollection={() => {
            this.setState({ sketchToAddToCollection: sketch });
          }}
          t={t}
        />
      )
    }));
    return (
      <div>
        <Table
          key={username}
          username={username}
          headerRow={SketchListHeaderRow}
          dataRows={sketchTableRows}
          listType="SketchList"
          searchTerm={searchTerm}
        />
        {this.state.sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={this.props.t('SketchList.AddToCollectionOverlayTitle')}
            actions={<SearchBar />}
            closeOverlay={() =>
              this.setState({ sketchToAddToCollection: null })
            }
          >
            <AddToCollectionList
              project={this.state.sketchToAddToCollection}
              username={this.props.username}
              user={this.props.user}
            />
          </Overlay>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    sketches: state.sketches,
    user: state.user,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ProjectsActions), dispatch);
}

SketchTable.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  getProjects: PropTypes.func.isRequired,
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchTable.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  username: undefined,
  mobile: false
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchTable)
);
