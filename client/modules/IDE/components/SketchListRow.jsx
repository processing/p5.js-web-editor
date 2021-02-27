import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import slugify from 'slugify';
import dates from '../../../utils/formatDate';
import * as ProjectActions from '../actions/project';
import * as IdeActions from '../actions/ide';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.sketch.name,
      isFocused: false
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

  closeAll = () => {
    this.setState({
      renameOpen: false,
      optionsOpen: false
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
      this.props.changeProjectName(
        this.props.sketch.id,
        this.state.renameValue.trim()
      );
    }
  };

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.sketch.name,
      renameOpen: false
    });
  };

  handleDropdownOpen = () => {
    this.closeAll();
    this.openOptions();
  };

  handleRenameOpen = () => {
    this.closeAll();
    this.openRename();
  };

  handleSketchDownload = () => {
    this.props.exportProjectAsZip(this.props.sketch.id);
  };

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.sketch);
  };

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(
      this.props.sketch.id,
      this.props.sketch.name,
      this.props.username
    );
  };

  handleSketchDelete = () => {
    this.closeAll();
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

  renderViewButton = (sketchURL) => (
    <td className="sketch-list__dropdown-column">
      <Link to={sketchURL}>{this.props.t('SketchList.View')}</Link>
    </td>
  );

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

  render() {
    const { sketch, username, mobile } = this.props;
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
          <td>
            {mobile && 'Created: '}
            {formatDateCell(sketch.createdAt, mobile)}
          </td>
          <td>
            {mobile && 'Updated: '}
            {formatDateCell(sketch.updatedAt, mobile)}
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
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
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

export default withTranslation()(
  connect(null, mapDispatchToPropsSketchListRow)(SketchListRowBase)
);
