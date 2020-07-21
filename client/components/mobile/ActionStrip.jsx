import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { prop, remSize } from '../../theme';
import IconButton from './IconButton';
import { CodeIcon } from '../../common/icons';
import * as IDEActions from '../../modules/IDE/actions/ide';

const background = prop('MobilePanel.default.background');
const textColor = prop('primaryTextColor');

const BottomBarContent = styled.h2`
  padding: ${remSize(8)};
  
  svg {
    max-height: ${remSize(32)};
    /* padding: ${remSize(4)} */
  }
`;

export default () => {
  const { expandConsole } = bindActionCreators(IDEActions, useDispatch());

  const actions = [{ icon: CodeIcon, aria: 'Say Something', action: expandConsole }];

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
