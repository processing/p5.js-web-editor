import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import React from 'react';

/**
 * react-router v6+ uses `element` instead of `component`.
 * This wrapper allows passing the component itself and will inject the necessary props to mimic the old behavior.
 */
export const ElementFromComponent = ({ component: Component }) => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  return <Component location={location} params={params} navigate={navigate} />;
};

ElementFromComponent.propTypes = {
  component: PropTypes.elementType.isRequired
};

/**
 * react-router no longer exports a `withRouter` HOC as hooks are the desired way to access this data.
 * Create an HOC to use with legacy class components that cannot use hooks.
 * Provides `navigate` (not `history`), `location`, and `params`.
 */
export const withRouter = (Component) => (props) => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  return (
    <Component
      location={location}
      params={params}
      navigate={navigate}
      {...props}
    />
  );
};
