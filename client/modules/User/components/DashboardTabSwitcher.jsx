import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MediaQuery from 'react-responsive';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FilterIcon } from '../../../common/icons';
import IconButton from '../../../components/mobile/IconButton';
import { Options } from '../../IDE/components/Header/MobileNav';
import { toggleDirectionForField } from '../../IDE/actions/sorting';

export const TabKey = {
  assets: 'assets',
  collections: 'collections',
  sketches: 'sketches'
};

const Tab = ({ children, isSelected, to }) => {
  const selectedClassName = 'dashboard-header__tab--selected';

  const location = { pathname: to, state: { skipSavingPath: true } };
  const content = isSelected ? (
    <span>{children}</span>
  ) : (
    <Link to={location}>{children}</Link>
  );
  return (
    <li className={`dashboard-header__tab ${isSelected && selectedClassName}`}>
      <h4 className="dashboard-header__tab__title">{content}</h4>
    </li>
  );
};

Tab.propTypes = {
  children: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  to: PropTypes.string.isRequired
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
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ul className="dashboard-header__switcher">
      <div className="dashboard-header__tabs">
        <Tab
          to={`/${username}/sketches`}
          isSelected={currentTab === TabKey.sketches}
        >
          {t('DashboardTabSwitcher.Sketches')}
        </Tab>
        <Tab
          to={`/${username}/collections`}
          isSelected={currentTab === TabKey.collections}
        >
          {t('DashboardTabSwitcher.Collections')}
        </Tab>
        {isOwner && (
          <Tab
            to={`/${username}/assets`}
            isSelected={currentTab === TabKey.assets}
          >
            {t('DashboardTabSwitcher.Assets')}
          </Tab>
        )}
      </div>
      <MediaQuery maxWidth={770}>
        {(mobile) =>
          mobile &&
          currentTab !== TabKey.assets && (
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
                      onClick={() =>
                        dispatch(toggleDirectionForField('createdAt'))
                      }
                    >
                      {t('CollectionList.HeaderCreatedAt')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        dispatch(toggleDirectionForField('updatedAt'))
                      }
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
          )
        }
      </MediaQuery>
    </ul>
  );
};

DashboardTabSwitcher.propTypes = {
  currentTab: PropTypes.string.isRequired,
  isOwner: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired
};

export default DashboardTabSwitcher;
