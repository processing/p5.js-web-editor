import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { remSize } from '../../theme';
import IconButton from './IconButton';
import { TerminalIcon } from '../../common/icons';
import * as IDEActions from '../../modules/IDE/actions/ide';

const BottomBarContent = styled.h2`
  padding: ${remSize(8)};
  
  svg {
    max-height: ${remSize(32)};
  }
`;

export default () => {
  const { expandConsole, collapseConsole } = bindActionCreators(IDEActions, useDispatch());
  const { consoleIsExpanded } = useSelector(state => state.ide);

  const actions = [{ icon: TerminalIcon, aria: 'Say Something', action: consoleIsExpanded ? collapseConsole : expandConsole }];

  return (
    <BottomBarContent>
      {actions.map(({ icon, aria, action }) =>
        (<IconButton
          icon={icon}
          aria-label={aria}
          key={`bottom-bar-${aria}`}
          onClick={() => action()}
        />))}
    </BottomBarContent>
  );
};
