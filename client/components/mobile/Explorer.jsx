import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { remSize, prop } from '../../theme';
import Sidebar from './Sidebar';
import SidebarMenu from './SidebarMenu';
import ConnectedFileNode from '../../modules/IDE/components/FileNode';

const SubHeader = styled.h3`
  padding: ${remSize(16)};
  color: ${prop('primaryTextColor')};
  font-weight: bold;
  border-bottom: 1px solid ${prop('Separator')};
`;

const Explorer = ({ id, canEdit, onPressClose }) => {
  const { t } = useTranslation();
  return (
    <Sidebar title={t('Nav.Auth.Hello')}>
      <SidebarMenu title="Menu" />
      <SubHeader>{t('Sidebar.Title')}</SubHeader>
      <ConnectedFileNode
        id={id}
        canEdit={canEdit}
        onClickFile={() => onPressClose()}
      />
    </Sidebar>
  );
};

Explorer.propTypes = {
  id: PropTypes.string.isRequired,
  onPressClose: PropTypes.func,
  canEdit: PropTypes.bool
};
Explorer.defaultProps = {
  canEdit: false,
  onPressClose: () => {}
};

export default Explorer;
