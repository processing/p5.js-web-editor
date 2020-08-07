import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import ConnectedFileNode from '../../modules/IDE/components/FileNode';


const Explorer = ({ id, canEdit }) => (
  <Sidebar title="Files">
    <ConnectedFileNode id={id} canEdit={canEdit} />
  </Sidebar>
);

Explorer.propTypes = {
  id: PropTypes.number.isRequired,
  canEdit: PropTypes.bool
};
Explorer.defaultProps = {
  canEdit: false
};

export default Explorer;
