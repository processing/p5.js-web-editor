import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { remSize, prop } from '../../theme';
import LogoIcon from '../../images/p5js-logo-small.svg';
import SidebarHeader from './SidebarHeader';

const SidebarWrapper = styled.div`
  height: 100%;
  width: ${remSize(300)};

  position: fixed;
  z-index: 2;
  left: 0;

  background: ${prop('backgroundColor')};
  box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.1);
`;

const Sidebar = ({ title, onPressClose, children }) => {
  const { t } = useTranslation();
  return (
    <SidebarWrapper>
      {title && (
        <SidebarHeader title={title}>
          <LogoIcon
            role="img"
            aria-label={t('Common.p5logoARIA')}
            focusable="false"
            className="svg__logo"
          />
        </SidebarHeader>
      )}
      {children}
    </SidebarWrapper>
  );
};

Sidebar.propTypes = {
  title: PropTypes.string,
  onPressClose: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};

Sidebar.defaultProps = {
  title: null,
  children: [],
  onPressClose: () => {}
};

export default Sidebar;
