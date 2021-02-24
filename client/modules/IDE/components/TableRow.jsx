import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import slugify from 'slugify';
import prettyBytes from 'pretty-bytes';
import * as ProjectActions from '../actions/project';
import * as CollectionsActions from '../actions/collections';
import * as IdeActions from '../actions/ide';
import * as ToastActions from '../actions/toast';
import * as AssetActions from '../actions/assets';
import dates from '../../../utils/formatDate';

import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

class TableRow extends React.Component {
  static projectInCollection(project, collection) {
    return (
      collection.items.find((item) => item.project.id === project.id) != null
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      isFocused: false,
      renameOpen: false,
      renameValue: ''
    };
    this.renameInput = React.createRef();
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  };

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeAll();
      }
    }, 200);
  };

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  };

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  };

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  };

  closeAll = () => {
    this.setState({
      optionsOpen: false,
      renameOpen: false
    });
  };

  handleAddSketches = () => {
    this.closeAll();
    this.props.onAddSketches();
  };

  handleDropdownOpen = () => {
    this.closeAll();
    this.openOptions();
  };

  handleCollectionDelete = () => {
    this.closeAll();
    if (
      window.confirm(
        this.props.t('Common.DeleteConfirmation', {
          name: this.props.dataRow.name
        })
      )
    ) {
      this.props.deleteCollection(this.props.dataRow.id);
    }
  };

  handleRenameOpen = () => {
    this.closeAll();
    this.setState(
      {
        renameOpen: true,
        renameValue: this.props.dataRow.name
      },
      () => this.renameInput.current.focus()
    );
  };

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  };

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      this.updateName();
      this.closeAll();
    }
  };

  handleRenameBlur = () => {
    this.updateName();
    this.closeAll();
  };

  updateName = () => {
    const isValid = this.state.renameValue.trim().length !== 0;
    if (isValid) {
      if (this.props.listType === 'CollectionList') {
        this.props.editCollection(this.props.dataRow.id, {
          name: this.state.renameValue.trim()
        });
      } else if (this.props.listType === 'SketchList') {
        this.props.changeProjectName(
          this.props.dataRow.id,
          this.state.renameValue.trim()
        );
      }
    }
  };

  handleSketchDownload = () => {
    this.props.exportProjectAsZip(this.props.dataRow.id);
  };

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.dataRow);
  };

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(
      this.props.dataRow.id,
      this.props.dataRow.name,
      this.props.username
    );
  };

  handleSketchDelete = () => {
    this.closeAll();
    if (
      window.confirm(
        this.props.t('Common.DeleteConfirmation', {
          name: this.props.dataRow.name
        })
      )
    ) {
      this.props.deleteProject(this.props.dataRow.id);
    }
  };

  handleAssetDelete = () => {
    const { key, name } = this.props.dataRow;
    this.closeOptions();
    if (window.confirm(this.props.t('Common.DeleteConfirmation', { name }))) {
      this.props.deleteAssetRequest(key);
    }
  };

  renderDropdown = () => {
    const { optionsOpen } = this.state;
    const userIsOwner = this.props.user.username === this.props.username;

    return (
      <td className="sketch-list__dropdown-column">
        <button
          className="sketch-list__dropdown-button"
          onClick={this.toggleOptions}
          onBlur={this.onBlurComponent}
          onFocus={this.onFocusComponent}
          aria-label={this.props.t('SketchList.ToggleLabelARIA')}
        >
          <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
        </button>
        {optionsOpen && (
          <ul className="sketch-list__action-dialogue">
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleRenameOpen}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownRename')}
                </button>
              </li>
            )}
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchDownload}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                {this.props.t('SketchList.DropdownDownload')}
              </button>
            </li>
            {this.props.user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDuplicate}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownDuplicate')}
                </button>
              </li>
            )}
            {this.props.user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={() => {
                    this.props.onAddToCollection();
                    this.closeAll();
                  }}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownAddToCollection')}
                </button>
              </li>
            )}
            {/* <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchShare}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Share
              </button>
            </li> */}
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownDelete')}
                </button>
              </li>
            )}
          </ul>
        )}
      </td>
    );
  };

  renderActions = () => {
    const { optionsOpen } = this.state;
    const userIsOwner = this.props.user.username === this.props.username;

    return (
      <React.Fragment>
        <button
          className="sketch-list__dropdown-button"
          onClick={this.toggleOptions}
          onBlur={this.onBlurComponent}
          onFocus={this.onFocusComponent}
          aria-label={this.props.t(
            'CollectionListRow.ToggleCollectionOptionsARIA'
          )}
        >
          <DownFilledTriangleIcon title="Menu" />
        </button>
        {optionsOpen && (
          <ul className="sketch-list__action-dialogue">
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleAddSketches}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                {this.props.t('CollectionListRow.AddSketch')}
              </button>
            </li>
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleCollectionDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('CollectionListRow.Delete')}
                </button>
              </li>
            )}
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleRenameOpen}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('CollectionListRow.Rename')}
                </button>
              </li>
            )}
          </ul>
        )}
      </React.Fragment>
    );
  };

  renderCollectionName = () => {
    const { dataRow, username } = this.props;
    const { renameOpen, renameValue } = this.state;

    return (
      <React.Fragment>
        <Link
          to={{
            pathname: `/${username}/collections/${dataRow.id}`,
            state: { skipSavingPath: true }
          }}
        >
          {renameOpen ? '' : dataRow.name}
        </Link>
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
  };

  render() {
    if (this.props.listType === 'CollectionList') {
      const { dataRow, mobile } = this.props;
      return (
        <tr className="sketches-table__row" key={dataRow.id}>
          <th scope="row">
            <span className="sketches-table__name">
              {this.renderCollectionName()}
            </span>
          </th>
          <td>
            {mobile && 'Created: '}
            {dates.format(dataRow.createdAt)}
          </td>
          <td>
            {mobile && 'Updated: '}
            {dates.format(dataRow.updatedAt)}
          </td>
          <td>
            {mobile && '# sketches: '}
            {(dataRow.items || []).length}
          </td>
          <td className="sketch-list__dropdown-column">
            {this.renderActions()}
          </td>
        </tr>
      );
    } else if (this.props.listType === 'SketchList') {
      const { dataRow, username, mobile } = this.props;
      const { renameOpen, renameValue } = this.state;
      let url = `/${username}/sketches/${dataRow.id}`;
      if (username === 'p5') {
        url = `/${username}/sketches/${slugify(dataRow.name, '_')}`;
      }

      const name = (
        <React.Fragment>
          <Link to={url}>{renameOpen ? '' : dataRow.name}</Link>
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
            key={dataRow.id}
            onClick={this.handleRowClick}
          >
            <th scope="row">{name}</th>
            <td>
              {mobile && 'Created: '}
              {formatDateCell(dataRow.createdAt, mobile)}
            </td>
            <td>
              {mobile && 'Updated: '}
              {formatDateCell(dataRow.updatedAt, mobile)}
            </td>
            {this.renderDropdown()}
          </tr>
        </React.Fragment>
      );
    } else if (this.props.listType === 'AssetList') {
      const { dataRow, username, t } = this.props;
      const { optionsOpen } = this.state;
      return (
        <tr className="asset-table__row" key={dataRow.key}>
          <th scope="row">
            <Link to={dataRow.url} target="_blank">
              {dataRow.name}
            </Link>
          </th>
          <td>{prettyBytes(dataRow.size)}</td>
          <td>
            {dataRow.sketchId && (
              <Link to={`/${username}/sketches/${dataRow.sketchId}`}>
                {dataRow.sketchName}
              </Link>
            )}
          </td>
          <td className="asset-table__dropdown-column">
            <button
              className="asset-table__dropdown-button"
              onClick={this.toggleOptions}
              onBlur={this.onBlurComponent}
              onFocus={this.onFocusComponent}
              aria-label={t('AssetList.ToggleOpenCloseARIA')}
            >
              <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
            </button>
            {optionsOpen && (
              <ul className="asset-table__action-dialogue">
                <li>
                  <button
                    className="asset-table__action-option"
                    onClick={this.handleAssetDelete}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                  >
                    {t('AssetList.Delete')}
                  </button>
                </li>
                <li>
                  <Link
                    to={dataRow.url}
                    target="_blank"
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                    className="asset-table__action-option"
                  >
                    {t('AssetList.OpenNewTab')}
                  </Link>
                </li>
              </ul>
            )}
          </td>
        </tr>
      );
    }
    return null;
  }
}

TableRow.propTypes = {
  dataRow: PropTypes.oneOfType([
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      owner: PropTypes.shape({
        username: PropTypes.string.isRequired
      }).isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          project: PropTypes.shape({
            id: PropTypes.string.isRequired
          })
        })
      )
    }),
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    }),
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      sketchId: PropTypes.string,
      sketchName: PropTypes.string,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired
    })
  ]).isRequired,
  listType: PropTypes.string.isRequired,
  deleteAssetRequest: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteCollection: PropTypes.func.isRequired,
  editCollection: PropTypes.func.isRequired,
  onAddSketches: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

TableRow.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectActions,
      IdeActions,
      ToastActions,
      AssetActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(null, mapDispatchToPropsSketchListRow)(TableRow)
);
