import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ConnectedFileNode from '../../modules/IDE/components/FileNode';
import { selectRootFile } from '../../modules/IDE/selectors/files';
import Sidebar from './Sidebar';

const Explorer = ({ canEdit, onPressClose }) => {
  const { t } = useTranslation();
  const root = useSelector(selectRootFile);
  return (
    <Sidebar title={t('Explorer.Files')} onPressClose={onPressClose}>
      <ConnectedFileNode
        id={root.id}
        canEdit={canEdit}
        onClickFile={() => onPressClose()}
      />
    </Sidebar>
  );
};

Explorer.propTypes = {
  onPressClose: PropTypes.func,
  canEdit: PropTypes.bool
};
Explorer.defaultProps = {
  canEdit: false,
  onPressClose: () => {}
};

export default Explorer;
