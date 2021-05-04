import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import Item from './AddToListRow';
import Table from './Table';

const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t('AddToCollectionSketchList.Title');
    }
    return this.props.t('AddToCollectionSketchList.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  handleCollectionAdd = (sketch) => {
    this.props.addToCollection(this.props.collection.id, sketch.id);
  };

  handleCollectionRemove = (sketch) => {
    this.props.removeFromCollection(this.props.collection.id, sketch.id);
  };

  inCollection = (sketch) =>
    this.props.collection.items.find((item) =>
      item.isDeleted ? false : item.project.id === sketch.id
    ) != null;

  render() {
    const sketchesWithAddedStatus = this.props.sketches.map((sketch) => ({
      ...sketch,
      isAdded: this.inCollection(sketch),
      url: `/${this.props.username}/sketches/${sketch.id}`
    }));

    let content = null;

    const headerRow = [
      {
        name: '',
        field: '',
        type: 'nonSortable'
      },
      {
        name: this.props.t('SketchList.HeaderName'),
        field: 'name',
        type: 'string'
      },
      {
        name: '',
        field: '',
        type: 'nonSortable'
      }
    ];

    const sorting = {
      field: 'name',
      type: 'string',
      direction: DIRECTION.DESC
    };

    const extras = {
      emptyTableText: this.props.t('SketchList.NoSketches'),
      title: this.getSketchesTitle(),
      summary: this.props.t('SketchList.TableSummary'),
      buttonAscAriaLable: 'SketchList.ButtonLabelAscendingARIA',
      buttonDescAriaLable: 'SketchList.ButtonLabelDescendingARIA',
      arrowUpIconAriaLable: 'SketchList.DirectionAscendingARIA',
      arrowDownIconAriaLable: 'SketchList.DirectionDescendingARIA'
    };

    const handleAction = (sketch) => {
      if (sketch.isAdded) {
        this.handleCollectionRemove(sketch);
      } else {
        this.handleCollectionAdd(sketch);
      }
    };

    const dataRows = sketchesWithAddedStatus.map((sketch) => ({
      ...sketch,
      row: (
        <Item
          key={sketch.id}
          t={this.props.t}
          {...sketch}
          onSelect={(event) => {
            event.stopPropagation();
            event.currentTarget.blur();
            handleAction(sketch);
          }}
        />
      )
    }));
    content = (
      <Table
        key={this.props.username}
        username={this.props.username}
        headerRow={headerRow}
        dataRows={dataRows}
        extras={extras}
        sorting={sorting}
      />
    );

    return (
      <div className="collection-add-sketch">
        <div className="quick-add-wrapper">
          <Helmet>
            <title>{this.getSketchesTitle()}</title>
          </Helmet>
          {content}
        </div>
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        project: PropTypes.shape({
          id: PropTypes.string.isRequired
        })
      })
    )
  }).isRequired,
  username: PropTypes.string,
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  username: undefined
};

function mapStateToProps(state) {
  return {
    user: state.user,
    project: state.project,
    sketches: state.sketches
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectsActions, CollectionsActions, ToastActions),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
