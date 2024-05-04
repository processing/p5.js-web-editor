/* eslint-disable max-len */
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import slugify from 'slugify';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import dates from '../../../utils/formatDate';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import * as IdeActions from '../actions/ide';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import Overlay from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import getConfig from '../../../utils/getConfig';
import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });
class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renameOpen: false,
      renameValue: props.sketch.name,
      isPrivate: props.sketch.visibility === 'Private'
    };
    this.renameInput = React.createRef();
  }
  openRename = () => {
    this.setState(
      {
        renameOpen: true,
        renameValue: this.props.sketch.name
      },
      () => this.renameInput.current.focus()
    );
  };

  closeRename = () => {
    this.setState({
      renameOpen: false
    });
  };

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  };

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      this.updateName();
      this.closeRename();
    }
  };

  handleRenameBlur = () => {
    this.updateName();
    this.closeRename();
  };

  updateName = () => {
    const isValid = this.state.renameValue.trim().length !== 0;
    if (isValid) {
      this.props.changeProjectName(
        this.props.sketch.id,
        this.state.renameValue.trim()
      );
    }
  };

  handleSketchDownload = () => {
    const { sketch } = this.props;
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  handleSketchDuplicate = () => {
    this.props.cloneProject(this.props.sketch);
  };

  handleSketchShare = () => {
    this.props.showShareModal(
      this.props.sketch.id,
      this.props.sketch.name,
      this.props.username
    );
  };

  handleSketchDelete = () => {
    if (
      window.confirm(
        this.props.t('Common.DeleteConfirmation', {
          name: this.props.sketch.name
        })
      )
    ) {
      this.props.deleteProject(this.props.sketch.id);
    }
  };

  handleToggleVisibilityChange = (e, index, name) => {
    const isChecked = e.target.checked;
    this.setState(
      {
        isPrivate: isChecked
      },
      () => {
        console.log(this.state.isPrivate);
        const newVisibility = isChecked ? 'Private' : 'Public';
        this.props.changeVisibility(index, name, newVisibility);
      }
    );
  };
  renderToggleVisibility = (index, name) => (
    <div key={index}>
      <input
        defaultChecked={this.props.sketch.visibility === 'Private'}
        type="checkbox"
        className="visibility__toggle-checkbox"
        id={`toggle-${index}`}
        onChange={(e) => this.handleToggleVisibilityChange(e, index, name)}
      />

      <label htmlFor={`toggle-${index}`} className="visibility__toggle-label">
        <svg
          width="8"
          height="11"
          viewBox="0 0 8 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="lock"
        >
          <path
            d="M8 5.68627V10.0784C8 10.5882 7.54067 11 7.00478 11H0.995215C0.440191 11 0 10.5686 0 10.0784V5.68627C0 5.17647 0.440191 4.7451 0.995215 4.7451C1.09035 4.7451 1.16746 4.66798 1.16746 4.57285V2.90196C1.16746 1.29412 2.43062 0 3.98086 0C5.55024 0 6.8134 1.29412 6.8134 2.90196V4.55371C6.8134 4.65941 6.89908 4.7451 7.00478 4.7451C7.54067 4.7451 8 5.15686 8 5.68627ZM2.33716 3.11732C2.34653 4.01904 3.08017 4.7451 3.98194 4.7451C4.89037 4.7451 5.62679 4.00867 5.62679 3.10024V2.90196C5.62679 1.96078 4.89952 1.21569 3.98086 1.21569C3.10048 1.21569 2.33493 1.96078 2.33493 2.90196L2.33716 3.11732Z"
            fill="white"
            fillOpacity="0.4"
          />
        </svg>

        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="earth"
        >
          <path
            d="M10 5C10 5.42308 9.96154 5.80769 9.86539 6.15385C9.32692 8.34615 7.34615 10 5 10C2.57692 10 0.538462 8.25 0.0961538 5.96154C0.0384615 5.65385 0 5.34615 0 5V4.98077C0 4.84615 7.26432e-08 4.73077 0.0192308 4.63461C0.125111 3.25818 0.781552 2.01128 1.78053 1.1614C1.91355 1.04823 2.15362 1.13705 2.32692 1.11538C2.67308 1.03846 2.90385 0.788462 3.07692 0.846154C3.26923 0.903846 3.42308 1.11538 3.19231 1.26923C2.94231 1.40385 2.88462 1.63462 3.01923 1.75C3.15385 1.86538 3.34615 1.63462 3.61538 1.63462C3.88462 1.63462 4.21154 1.96154 4.19231 2.21154C4.15385 2.55769 4.15385 3 4.30769 3.28846C4.46154 3.57692 4.80769 4.01923 5.23077 4.13462C5.61539 4.23077 6.26923 4.32692 6.34615 4.34615C6.63419 4.45588 6.57131 4.6983 6.33349 4.89437C6.21892 4.98883 6.11852 5.09107 6.09615 5.17308C5.86539 5.88462 6.84615 6.11538 6.67308 6.59615C6.55769 6.94231 6.17308 7.28846 6.03846 7.63462C5.95671 7.84484 5.9246 8.14727 5.98523 8.37391C6.02693 8.52981 6.28488 8.43597 6.40385 8.32692C6.63462 8.13462 7.11539 7.44231 7.44231 7.21154C7.78846 6.98077 8.57692 6.78846 8.82692 6.01923C8.96154 5.59615 8.94231 5.21154 8.36539 4.88462C7.78846 4.55769 8.17308 4.15385 7.67308 4.15385C7.17308 4.15385 7.15385 4.34615 6.78846 4.21154C5.53846 3.71154 5.90385 3.23077 6.21154 3.21154C6.34615 3.19231 6.48077 3.25 6.65385 3.32692C6.82692 3.42308 6.88462 3.32692 6.84615 3.05769C6.80769 2.78846 6.86539 2.42308 7 1.98077C7.21154 1.26923 6.80769 0.634615 6.19231 0.557692C5.61539 0.442308 5.57692 0.653846 5.19231 1.07692C4.90385 1.40385 4.34615 1.13462 3.88462 0.807692C3.61454 0.611276 3.90971 0.105968 4.2399 0.0560849C4.48198 0.019514 4.72894 0 4.98077 0C7.69649 0 9.91771 2.18723 9.97993 4.91613C9.9806 4.94511 10 4.97101 10 5Z"
            fill="#929292"
          />
        </svg>
      </label>
    </div>
  );
  renderDropdown = () => {
    const userIsOwner = this.props.user.username === this.props.username;

    return (
      <td className="sketch-list__dropdown-column">
        <TableDropdown aria-label={this.props.t('SketchList.ToggleLabelARIA')}>
          <MenuItem hideIf={!userIsOwner} onClick={this.openRename}>
            {this.props.t('SketchList.DropdownRename')}
          </MenuItem>
          <MenuItem onClick={this.handleSketchDownload}>
            {this.props.t('SketchList.DropdownDownload')}
          </MenuItem>
          <MenuItem
            hideIf={!this.props.user.authenticated}
            onClick={this.handleSketchDuplicate}
          >
            {this.props.t('SketchList.DropdownDuplicate')}
          </MenuItem>

          <MenuItem
            hideIf={!this.props.user.authenticated}
            onClick={() => {
              this.props.onAddToCollection();
            }}
          >
            {this.props.t('SketchList.DropdownAddToCollection')}
          </MenuItem>

          {/*
          <MenuItem onClick={this.handleSketchShare}>
            Share
          </MenuItem>
            */}
          <MenuItem hideIf={!userIsOwner} onClick={this.handleSketchDelete}>
            {this.props.t('SketchList.DropdownDelete')}
          </MenuItem>
        </TableDropdown>
      </td>
    );
  };

  render() {
    const { sketch, username, mobile, user } = this.props;
    const userIsOwner = user.username === username;
    const { renameOpen, renameValue } = this.state;
    let url = `/${username}/sketches/${sketch.id}`;
    if (username === 'p5') {
      url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
    }

    const name = (
      <React.Fragment>
        <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
        {renameOpen && (
          <input
            value={renameValue}
            onChange={this.handleRenameChange}
            onKeyUp={this.handleRenameEnter}
            onBlur={this.handleRenameBlur}
            onClick={(e) => e.stopPropagation()}
            ref={this.renameInput}
          />
        )}
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <tr
          className="sketches-table__row"
          key={sketch.id}
          onClick={this.handleRowClick}
        >
          <th scope="row">{name}</th>
          <td>{formatDateCell(sketch.createdAt, mobile)}</td>
          <td>{formatDateCell(sketch.updatedAt, mobile)}</td>
          <td hidden={!userIsOwner}>
            {this.renderToggleVisibility(sketch.id, sketch.name)}
          </td>
          {this.renderDropdown()}
        </tr>
      </React.Fragment>
    );
  }
}

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    visibility: PropTypes.string
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  changeVisibility: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectActions, IdeActions),
    dispatch
  );
}

const SketchListRow = connect(
  null,
  mapDispatchToPropsSketchListRow
)(SketchListRowBase);

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.props.resetSorting();
    this.state = {
      isInitialDataLoad: true
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.sketches !== prevProps.sketches &&
      Array.isArray(this.props.sketches)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isInitialDataLoad: false
      });
    }
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t('SketchList.Title');
    }
    return this.props.t('SketchList.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  hasSketches() {
    return !this.isLoading() && this.props.sketches.length > 0;
  }

  isLoading() {
    return this.props.loading && this.state.isInitialDataLoad;
  }

  _renderLoader() {
    if (this.isLoading()) return <Loader />;
    return null;
  }

  _renderEmptyTable() {
    if (!this.isLoading() && this.props.sketches.length === 0) {
      return (
        <p className="sketches-table__empty">
          {this.props.t('SketchList.NoSketches')}
        </p>
      );
    }
    return null;
  }

  _getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = this.props.sorting;
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = this.props.t('SketchList.ButtonLabelAscendingARIA', {
          displayName
        });
      } else {
        buttonLabel = this.props.t('SketchList.ButtonLabelDescendingARIA', {
          displayName
        });
      }
    } else if (direction === SortingActions.DIRECTION.ASC) {
      buttonLabel = this.props.t('SketchList.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = this.props.t('SketchList.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };

  _renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = this.props.sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = this._getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => this.props.toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={this.props.t('SketchList.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
              <ArrowDownIcon
                role="img"
                aria-label={this.props.t('SketchList.DirectionDescendingARIA')}
                focusable="false"
              />
            )}
        </button>
      </th>
    );
  };

  render() {
    const userIsOwner = this.props.user.username === this.props.username;
    const username =
      this.props.username !== undefined
        ? this.props.username
        : this.props.user.username;
    const { mobile } = this.props;
    return (
      <article className="sketches-table-container">
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasSketches() && (
          <table
            className="sketches-table"
            summary={this.props.t('SketchList.TableSummary')}
          >
            <thead>
              <tr>
                {this._renderFieldHeader(
                  'name',
                  this.props.t('SketchList.HeaderName')
                )}
                {this._renderFieldHeader(
                  'createdAt',
                  this.props.t('SketchList.HeaderCreatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}
                {this._renderFieldHeader(
                  'updatedAt',
                  this.props.t('SketchList.HeaderUpdatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}

                {userIsOwner &&
                  this._renderFieldHeader('makePrivate', 'Make Private', {
                    context: mobile ? 'mobile' : ''
                  })}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map((sketch) => (
                <SketchListRow
                  mobile={mobile}
                  key={sketch.id}
                  sketch={sketch}
                  user={this.props.user}
                  username={username}
                  onAddToCollection={() => {
                    this.setState({ sketchToAddToCollection: sketch });
                  }}
                  t={this.props.t}
                />
              ))}
            </tbody>
          </table>
        )}
        {this.state.sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={this.props.t('SketchList.AddToCollectionOverlayTitle')}
            closeOverlay={() =>
              this.setState({ sketchToAddToCollection: null })
            }
          >
            <AddToCollectionList
              projectId={this.state.sketchToAddToCollection.id}
            />
          </Overlay>
        )}
      </article>
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
      updatedAt: PropTypes.string.isRequired,
      visibility: PropTypes.string
    })
  ).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  username: undefined,
  mobile: false
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: getSortedSketches(state),
    sorting: state.sorting,
    loading: state.loading,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      ProjectsActions,
      CollectionsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
