import PropTypes from 'prop-types';
import React from 'react';
import CopyableInput from './CopyableInput';

class ShareModal extends React.PureComponent {
  render() {
    const {
      projectId,
      ownerUsername,
      projectName
    } = this.props;
    const hostname = window.location.origin;
    return (
      <div className="share-modal">
        <h3 className="share-modal__project-name">
          {projectName}
        </h3>
        <CopyableInput
          label="Embed"
          value={`<iframe src="${hostname}/embed/${projectId}"></iframe>`}
        />
        <CopyableInput
          label="Fullscreen"
          value={`${hostname}/full/${projectId}`}
        />
        <CopyableInput
          label="Edit"
          value={`${hostname}/${ownerUsername}/sketches/${projectId}`}
        />
      </div>
    );
  }
}

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  ownerUsername: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired
};

export default ShareModal;
