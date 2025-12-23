import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export interface RouterTabProps {
  children: ReactNode;
  to: string;
}

/**
 * Wraps the react-router `NavLink` with dashboard-header__tab styling.
 */
export const RouterTab = ({ children, to }: RouterTabProps) => (
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
