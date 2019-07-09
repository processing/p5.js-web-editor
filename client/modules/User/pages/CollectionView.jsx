import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { updateSettings, initiateVerification, createApiKey, removeApiKey } from '../actions';
import NavBasic from '../../../components/NavBasic';

import CollectionCreate from '../components/CollectionCreate';

class CollectionView extends React.Component {
  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  ownerName() {
    if (this.props.params.username) {
      return this.props.params.username;
    }

    return this.props.user.username;
  }

  pageTitle() {
    if (this.isCreatePage()) {
      return 'Create collection';
    }

    return 'collection';
  }

  isOwner() {
    return this.props.user.username === this.props.params.username;
  }

  isCreatePage() {
    const path = this.props.location.pathname;
    return /create$/.test(path);
  }

  renderContent() {
    if (this.isCreatePage() && this.isOwner()) {
      return <CollectionCreate />;
    }

    return 'collection page';
  }

  render() {
    return (
      <div className="dashboard">
        <NavBasic onBack={this.closeAccountPage} />

        <section className="dashboard-header">
          <div className="dashboard-header__header">
            <h2 className="dashboard-header__header__title">{this.pageTitle()}</h2>
          </div>

          <div className="dashboard-content">
            {this.renderContent()}
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user,
    theme: state.preferences.theme
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateSettings, initiateVerification, createApiKey, removeApiKey
  }, dispatch);
}

CollectionView.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  previousPath: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(CollectionView);
