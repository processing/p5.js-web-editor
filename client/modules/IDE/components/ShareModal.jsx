import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import CopyableInput from './CopyableInput';
import getConfig from '../../../utils/getConfig';

class ShareModal extends React.PureComponent {
  render() {
    const { projectId, ownerUsername, projectName } = this.props;
    const hostname = window.location.origin;
    const previewUrl = getConfig('PREVIEW_URL');
    return (
      <div className="share-modal">
        <h3 className="share-modal__project-name">{projectName}</h3>
        <CopyableInput
          label={this.props.t('ShareModal.Embed')}
          value={`<iframe src="${previewUrl}/${ownerUsername}/embed/${projectId}"></iframe>`}
        />
        <CopyableInput
          label={this.props.t('ShareModal.Present')}
          hasPreviewLink
          value={`${previewUrl}/${ownerUsername}/present/${projectId}`}
        />
        <CopyableInput
          label={this.props.t('ShareModal.Fullscreen')}
          hasPreviewLink
          value={`${hostname}/${ownerUsername}/full/${projectId}`}
        />
        <CopyableInput
          label={this.props.t('ShareModal.Edit')}
          hasPreviewLink
          value={`${hostname}/${ownerUsername}/sketches/${projectId}`}
        />
      </div>
    );
  }
}

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  ownerUsername: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(ShareModal);
