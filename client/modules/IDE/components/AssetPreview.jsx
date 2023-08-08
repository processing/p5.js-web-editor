import mime from 'mime';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Audio = styled.audio`
  width: 90%;
  margin: 30px 5%;
`;

const Image = styled.img`
  max-width: 100%;
  height: auto;
`;

const Video = styled.video`
  max-width: 100%;
  height: auto;
`;

function AssetPreview({ url, name }) {
  const contentType = mime.getType(url);
  const type = contentType?.split('/')[0];

  switch (type) {
    case 'image':
      return <Image src={url} alt={`Preview of file ${name}`} />;
    case 'audio':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <Audio src={url} controls preload="metadata" />;
    case 'video':
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <Video controls preload="metadata">
          <source src={url} type={contentType} />
        </Video>
      );
    default:
      return null;
  }
}

AssetPreview.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default AssetPreview;
