import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import ConnectedFileNode from '../../modules/IDE/components/FileNode';


const Explorer = ({ id, canEdit, onPressClose }) => {
  const { t, i18n } = useTranslation();
  return (
    <Sidebar title={t('MobileSideBar.Files')} onPressClose={onPressClose}>
      <ConnectedFileNode id={id} canEdit={canEdit} onClickFile={() => onPressClose()} />
    </Sidebar>
  );
};

Explorer.propTypes = {
  id: PropTypes.number.isRequired,
  onPressClose: PropTypes.func,
  canEdit: PropTypes.bool
};
Explorer.defaultProps = {
  canEdit: false,
  onPressClose: () => {}
};

export default Explorer;
