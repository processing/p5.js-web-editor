import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import prettyBytes from 'pretty-bytes';
import { withTranslation } from 'react-i18next';

import * as AssetActions from '../actions/assets';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';

class AssetListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      optionsOpen: false
    };
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  };

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeOptions();
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

  handleDropdownOpen = () => {
    this.closeOptions();
    this.openOptions();
  };

  handleAssetDelete = () => {
    const { key, name } = this.props.asset;
    this.closeOptions();
    if (window.confirm(this.props.t('Common.DeleteConfirmation', { name }))) {
      this.props.deleteAssetRequest(key);
    }
  };

  render() {
    const { asset, username, t } = this.props;
    const { optionsOpen } = this.state;
    return (
      <tr className="asset-table__row" key={asset.key}>
        <th scope="row">
          <Link to={asset.url} target="_blank">
            {asset.name}
          </Link>
        </th>
        <td>{prettyBytes(asset.size)}</td>
        <td>
          {asset.sketchId && (
            <Link to={`/${username}/sketches/${asset.sketchId}`}>
              {asset.sketchName}
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
                  to={asset.url}
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
}

AssetListRowBase.propTypes = {
  asset: PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    sketchId: PropTypes.string,
    sketchName: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  deleteAssetRequest: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

function mapStateToPropsAssetListRow(state) {
  return {
    username: state.user.username
  };
}

function mapDispatchToPropsAssetListRow(dispatch) {
  return bindActionCreators(AssetActions, dispatch);
}

export default withTranslation()(
  connect(
    mapStateToPropsAssetListRow,
    mapDispatchToPropsAssetListRow
  )(AssetListRowBase)
);
