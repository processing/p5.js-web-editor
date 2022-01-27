import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as ProjectActions from '../../actions/project';
import * as CollectionsActions from '../../actions/collections';
import * as IdeActions from '../../actions/ide';
import * as ToastActions from '../../actions/toast';
import dates from '../../../../utils/formatDate';

import DownFilledTriangleIcon from '../../../../images/down-filled-triangle.svg';

class CollectionListRowBase extends React.Component {
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
          name: this.props.collection.name
        })
      )
    ) {
      this.props.deleteCollection(this.props.collection.id);
    }
  };

  handleRenameOpen = () => {
    this.closeAll();
    this.setState(
      {
        renameOpen: true,
        renameValue: this.props.collection.name
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
      this.props.editCollection(this.props.collection.id, {
        name: this.state.renameValue.trim()
      });
    }
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
    const { collection, username } = this.props;
    const { renameOpen, renameValue } = this.state;

    return (
      <React.Fragment>
        <Link
          to={{
            pathname: `/${username}/collections/${collection.id}`,
            state: { skipSavingPath: true }
          }}
        >
          {renameOpen ? '' : collection.name}
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
    const { collection, mobile } = this.props;

    return (
      <tr className="sketches-table__row" key={collection.id}>
        <th scope="row">
          <span className="sketches-table__name">
            {this.renderCollectionName()}
          </span>
        </th>
        <td>
          {mobile && 'Created: '}
          {dates.format(collection.createdAt)}
        </td>
        <td>
          {mobile && 'Updated: '}
          {dates.format(collection.updatedAt)}
        </td>
        <td>
          {mobile && '# sketches: '}
          {(collection.items || []).length}
        </td>
        <td className="sketch-list__dropdown-column">{this.renderActions()}</td>
      </tr>
    );
  }
}

CollectionListRowBase.propTypes = {
  collection: PropTypes.shape({
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
  }).isRequired,
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

CollectionListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectActions,
      IdeActions,
      ToastActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(null, mapDispatchToPropsSketchListRow)(CollectionListRowBase)
);
