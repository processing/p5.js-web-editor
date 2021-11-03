import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Nav from '../../../components/Nav';

import CollectionCreate from '../components/CollectionCreate';
import Collection from '../components/Collection';

class CollectionView extends React.Component {
  static defaultProps = {
    user: null
  };

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  ownerName() {
    if (this.props.params.username) {
      return this.props.params.username;
    }

    return this.props.user.username;
  }

  pageTitle() {
    if (this.isCreatePage()) {
      return this.props.t('CollectionView.TitleCreate');
    }

    return this.props.t('CollectionView.TitleDefault');
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

    return (
      <Collection
        collectionId={this.props.params.collection_id}
        username={this.props.params.username}
      />
    );
  }

  render() {
    return (
      <div className="dashboard">
        <Nav layout="dashboard" />

        {this.renderContent()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    theme: state.preferences.theme
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

CollectionView.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  params: PropTypes.shape({
    collection_id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired
  }).isRequired,
  theme: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  t: PropTypes.func.isRequired
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(CollectionView)
);
