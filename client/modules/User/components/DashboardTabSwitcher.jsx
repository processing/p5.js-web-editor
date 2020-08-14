import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

const TabKey = {
  assets: 'assets',
  collections: 'collections',
  sketches: 'sketches',
};

const Tab = ({ children, isSelected, to }) => {
  const selectedClassName = 'dashboard-header__tab--selected';

  const location = { pathname: to, state: { skipSavingPath: true } };
  const content = isSelected ? <span>{children}</span> : <Link to={location}>{children}</Link>;
  return (
    <li className={`dashboard-header__tab ${isSelected && selectedClassName}`}>
      <h4 className="dashboard-header__tab__title">
        {content}
      </h4>
    </li>
  );
};

Tab.propTypes = {
  children: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  to: PropTypes.string.isRequired,
};

const DashboardTabSwitcher = ({
  currentTab, isOwner, username, translate
}) => (
  <ul className="dashboard-header__switcher">
    <div className="dashboard-header__tabs">
      <Tab to={`/${username}/sketches`} isSelected={currentTab === TabKey.sketches}>{translate('DashboardTabSwitcher.Sketches')}</Tab>
      <Tab to={`/${username}/collections`} isSelected={currentTab === TabKey.collections}>{translate('DashboardTabSwitcher.Collections')}</Tab>
      {isOwner && <Tab to={`/${username}/assets`} isSelected={currentTab === TabKey.assets}>{translate('DashboardTabSwitcher.Assets')}</Tab>}
    </div>
  </ul>
);

DashboardTabSwitcher.propTypes = {
  currentTab: PropTypes.string.isRequired,
  isOwner: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired
};

export { DashboardTabSwitcher as default, TabKey };
