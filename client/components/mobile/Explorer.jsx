import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import ConnectedFileNode from '../../modules/IDE/components/FileNode';

const Explorer = ({ id, canEdit, onPressClose }) => {
  const { t } = useTranslation();
  return (
    <Sidebar title={t('Nav.Auth.Hello')} onPressClose={onPressClose}>
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
