import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';
import IconButton from './IconButton';

const BottomBarContent = styled.div`
  padding: ${remSize(8)};
  display: grid;
  grid-template-columns: repeat(8,1fr);

  svg {
    max-height: ${remSize(32)};
  }

  path { fill: ${prop('primaryTextColor')} !important }

  .inverted {
    path { fill: ${prop('backgroundColor')} !important }
    rect { fill: ${prop('primaryTextColor')} !important }
  }
`;

const ActionStrip = ({ actions }) => (
  <BottomBarContent>
    {actions.map(({
      icon, aria, action, inverted
    }) =>
      (<IconButton
        inverted={inverted}
        className={inverted && 'inverted'}
        icon={icon}
        aria-label={aria}
        key={`bottom-bar-${aria}`}
        onClick={action}
      />))}
  </BottomBarContent>);

ActionStrip.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.component,
    aria: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    inverted: PropTypes.bool
  })).isRequired
};

export default ActionStrip;
