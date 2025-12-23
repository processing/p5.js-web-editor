import React, { useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getIsUserOwner } from './modules/IDE/selectors/users';
import { resetProject } from './modules/IDE/actions/project';

// eslint-disable-next-line react/prop-types
const ProtectedSketchRoute = ({ component: Component, ...rest }) => {
  const project = useSelector((state) => state.project);
  const isUserOwner = useSelector(getIsUserOwner);
  const dispatch = useDispatch();
  const hasAccess = isUserOwner || project.visibility !== 'Private';
  useEffect(() => {
    if (!hasAccess) {
      dispatch(resetProject());
    }
  }, [hasAccess, dispatch]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!hasAccess) {
          return <Redirect to="/" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedSketchRoute;
