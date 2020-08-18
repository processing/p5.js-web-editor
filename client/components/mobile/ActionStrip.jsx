import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { remSize, prop } from '../../theme';
import IconButton from './IconButton';
import { TerminalIcon, FolderIcon } from '../../common/icons';
import * as IDEActions from '../../modules/IDE/actions/ide';

const BottomBarContent = styled.div`
  padding: ${remSize(8)};
  display: flex;

  svg {
    max-height: ${remSize(32)};

  }

  path { fill: ${prop('primaryTextColor')} !important }

  .inverted {
    path { fill: ${prop('backgroundColor')} !important }
    rect { fill: ${prop('primaryTextColor')} !important }
  }
`;

// Maybe this component shouldn't be connected, and instead just receive the `actions` prop
const ActionStrip = ({ toggleExplorer }) => {
  const { expandConsole, collapseConsole } = bindActionCreators(IDEActions, useDispatch());
  const { consoleIsExpanded } = useSelector(state => state.ide);

  const actions = [
    {
      icon: TerminalIcon, inverted: true, aria: 'Open terminal console', action: consoleIsExpanded ? collapseConsole : expandConsole
    },
    { icon: FolderIcon, aria: 'Open files explorer', action: toggleExplorer }
  ];

  return (
    <BottomBarContent>
      {actions.map(({
        icon, aria, action, inverted
      }) =>
        (
          <IconButton
            inverted={inverted}
            className={inverted && 'inverted'}
            icon={icon}
            aria-label={aria}
            key={`bottom-bar-${aria}`}
            onClick={() => action()}
          />))}
    </BottomBarContent>
  );
};

ActionStrip.propTypes = {
  toggleExplorer: PropTypes.func
};

ActionStrip.defaultProps = {
  toggleExplorer: () => {}
};

export default ActionStrip;
