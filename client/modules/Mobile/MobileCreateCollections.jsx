import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import { useTranslation } from 'react-i18next';

import IconButton from '../../components/mobile/IconButton';
import Screen from '../../components/mobile/MobileScreen';
import Header from '../../components/mobile/Header';
import { ExitIcon } from '../../common/icons';
import CollectionCreate from '../User/components/CollectionCreate';

const MobileCreateCollections = ({ params }) => {
  const user = useSelector((state) => state.user);

  const { t } = useTranslation();

  const ownerName = params.username || user.username;

  return (
    <Screen fullscreen>
      <section>
        <Header transparent title={t('DashboardView.CreateCollectionOverlay')}>
          <IconButton
            to={`/${ownerName}/collections`}
            icon={ExitIcon}
            aria-label="Return to collections"
          />
        </Header>
        <CollectionCreate />
      </section>
    </Screen>
  );
};

MobileCreateCollections.propTypes = {
  params: PropTypes.shape({
    username: PropTypes.string.isRequired
  })
};

MobileCreateCollections.defaultProps = { params: {} };

export default withRouter(MobileCreateCollections);
