import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { remSize, prop } from '../../theme';
import RightIcon from '../../images/triangle-arrow-right.svg';
import DownIcon from '../../images/triangle-arrow-down.svg';

const MenuItem = styled.li`
  padding: ${remSize(14)};
  padding-left: ${remSize(28)};
  font-size: ${remSize(14)};
`;

const MenuContainer = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  background-color: ${prop('backgroundColor')};
  border-bottom: 1px solid ${prop('Separator')};
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${remSize(16)};
  border-bottom: 1px solid ${prop('Separator')};
`;

const MenuTitle = styled.h3`
  color: ${prop('primaryTextColor')};
  font-weight: bold;
`;

const MenuIcon = styled.span`
  & g,
  & path {
    opacity: 1;
    fill: ${prop('Icon.default')};
  }
  margin-right: ${remSize(5)};
`;

const SidebarMenu = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <MenuHeader onClick={() => setExpanded(!expanded)}>
        <MenuTitle>Menu</MenuTitle>
        <MenuIcon>
          {expanded ? (
            <DownIcon focusable="false" aria-hidden="true" />
          ) : (
            <RightIcon focusable="false" aria-hidden="true" />
          )}
        </MenuIcon>
      </MenuHeader>
      {expanded && (
        <MenuContainer>
          <MenuItem>{t('Nav.File.Title')}</MenuItem>
          <MenuItem>{t('Nav.Edit.Title')}</MenuItem>
          <MenuItem>{t('Nav.Sketch.Title')}</MenuItem>
          <MenuItem>{t('Nav.Help.Title')}</MenuItem>
        </MenuContainer>
      )}
    </div>
  );
};

SidebarMenu.propTypes = {};

SidebarMenu.defaultProps = {};

export default SidebarMenu;
