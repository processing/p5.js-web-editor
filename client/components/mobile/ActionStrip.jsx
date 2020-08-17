import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize } from '../../theme';
import IconButton from './IconButton';

const BottomBarContent = styled.div`
  display: grid;
  grid-template-columns: repeat(8,1fr);
  padding: ${remSize(8)};
  
  svg {
    max-height: ${remSize(32)};
  }
`;

const ActionStrip = ({ actions }) => (
  <BottomBarContent>
    {actions.map(({ icon, aria, action }) =>
      (<IconButton
        icon={icon}
        aria-label={aria}
        key={`bottom-bar-${aria}`}
        onClick={() => action()}
      />))}
  </BottomBarContent>);

ActionStrip.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.element.isRequired,
    aria: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
  })).isRequired
};

export default ActionStrip;
