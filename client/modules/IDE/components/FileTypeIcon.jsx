import React from 'react';
import PropTypes from 'prop-types';
import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript } from 'react-icons/io';
import { TbFileTypeXml, TbTxt, TbCsv } from 'react-icons/tb';
import { VscJson } from 'react-icons/vsc';
import FileIcon from '../../../images/file.svg';

export default function FileTypeIcon({ fileExtension }) {
  switch (fileExtension) {
    case '.html':
      return (
        <span>
          <IoLogoHtml5 />
        </span>
      );
    case '.css':
      return (
        <span>
          <IoLogoCss3 />
        </span>
      );
    case '.js':
      return (
        <span>
          <IoLogoJavascript />
        </span>
      );
    case '.json':
      return (
        <span>
          <VscJson />
        </span>
      );
    case '.xml':
      return (
        <span>
          <TbFileTypeXml />
        </span>
      );
    case '.txt':
      return (
        <span>
          <TbTxt />
        </span>
      );
    case '.csv':
      return (
        <span>
          <TbCsv />
        </span>
      );
    default:
      return <FileIcon focusable="false" aria-hidden="true" />;
  }
}

FileTypeIcon.propTypes = {
  fileExtension: PropTypes.string.isRequired
};
