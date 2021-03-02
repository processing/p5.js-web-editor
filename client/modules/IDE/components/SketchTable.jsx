import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ProjectsActions from '../actions/projects';
import Table from './Table';
import SketchListRow from './SketchListRow';
import Overlay from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import { CollectionSearchbar } from './Searchbar';

const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

class SketchTable extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);

    this.state = {
      sketchToAddToCollection: null
    };
  }

  getTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t(`SketchList.Title`);
    }
    return this.props.t(`SketchList.AnothersTitle`, {
      anotheruser: this.props.username
    });
  }

  render() {
    const {
      username,
      sketches,
      searchTerm,
      mobile,
      user,
      project,
      t
    } = this.props;

    const extras = {
      emptyTableText: this.props.t('SketchList.NoSketches'),
      title: this.getTitle(),
      summary: this.props.t('SketchList.TableSummary'),
      buttonAscAriaLable: 'SketchList.ButtonLabelAscendingARIA',
      buttonDescAriaLable: 'SketchList.ButtonLabelDescendingARIA',
      arrowUpIconAriaLable: 'SketchList.DirectionAscendingARIA',
      arrowDownIconAriaLable: 'SketchList.DirectionDescendingARIA'
    };

    const sorting = {
      field: 'createdAt',
      type: 'date',
      direction: DIRECTION.DESC
    };

    const SketchListHeaderRow = [
      {
        field: 'name',
        name: this.props.t('SketchList.HeaderName'),
        type: 'string'
      },
      {
        field: 'createdAt',
        name: this.props.t('SketchList.HeaderCreatedAt'),
        type: 'date'
      },
      {
        field: 'updatedAt',
        name: this.props.t('SketchList.HeaderUpdatedAt'),
        type: 'date'
      },
      {
        field: '',
        name: '',
        type: 'nonSortable'
      }
    ];

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
      <React.Fragment>
        <Table
          key={username}
          username={username}
          headerRow={SketchListHeaderRow}
          dataRows={sketchTableRows}
          searchTerm={searchTerm}
          extras={extras}
          sorting={sorting}
        />
        {this.state.sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={this.props.t('SketchList.AddToCollectionOverlayTitle')}
            actions={<CollectionSearchbar />}
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
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    sketches: state.sketches,
    user: state.user,
    project: state.project,
    searchTerm: state.search.sketchSearchTerm
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
