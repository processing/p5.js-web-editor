import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Wraps the react-router `NavLink` with dashboard-header__tab styling.
 */
const Tab = ({ children, to }) => (
  <li className="dashboard-header__tab">
    <NavLink
      className="dashboard-header__tab__title"
      activeClassName="dashboard-header__tab--selected"
      to={{ pathname: to, state: { skipSavingPath: true } }}
    >
      {children}
    </NavLink>
  </li>
);

Tab.propTypes = {
  children: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired
};

export default Tab;
