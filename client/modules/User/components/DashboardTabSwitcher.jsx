import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FilterIcon } from '../../../common/icons';
import IconButton from '../../../common/IconButton';
import RouterTab from '../../../common/RouterTab';
import { Options } from '../../IDE/components/Header/MobileNav';
import { toggleDirectionForField } from '../../IDE/actions/sorting';
import useIsMobile from '../../IDE/hooks/useIsMobile';

export const TabKey = {
  assets: 'assets',
  collections: 'collections',
  sketches: 'sketches'
};

// It is good for right now, because we need to separate the nav dropdown logic from the navBar before we can use it here
const FilterOptions = styled(Options)`
  > div > button:focus + ul,
  > div > ul > button:focus ~ div > ul {
    transform: scale(1);
    opacity: 1;
  }
`;

const DashboardTabSwitcher = ({ currentTab, isOwner, username }) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className="dashboard-header__switcher">
      <ul className="dashboard-header__tabs">
        <RouterTab to={`/${username}/sketches`}>
          {t('DashboardTabSwitcher.Sketches')}
        </RouterTab>
        <RouterTab to={`/${username}/collections`}>
          {t('DashboardTabSwitcher.Collections')}
        </RouterTab>
        {isOwner && (
          <RouterTab to={`/${username}/assets`}>
            {t('DashboardTabSwitcher.Assets')}
          </RouterTab>
        )}
      </ul>
      {isMobile && currentTab !== TabKey.assets && (
        <FilterOptions>
          <div>
            <IconButton icon={FilterIcon} />
            <ul>
              <li>
                <button
                  onClick={() => dispatch(toggleDirectionForField('name'))}
                >
                  {t('CollectionList.HeaderName')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch(toggleDirectionForField('createdAt'))}
                >
                  {t('CollectionList.HeaderCreatedAt')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch(toggleDirectionForField('updatedAt'))}
                >
                  {t('CollectionList.HeaderUpdatedAt')}
                </button>
              </li>
              {currentTab === TabKey.collections && (
                <li>
                  <button
                    onClick={() =>
                      dispatch(toggleDirectionForField('numItems'))
                    }
                  >
                    {t('CollectionList.HeaderNumItems')}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </FilterOptions>
      )}
    </div>
  );
};

DashboardTabSwitcher.propTypes = {
  currentTab: PropTypes.string.isRequired,
  isOwner: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired
};

export default DashboardTabSwitcher;
