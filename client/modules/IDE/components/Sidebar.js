import React, { PropTypes } from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
const rightArrowUrl = require('../../../images/right-arrow.svg');
const leftArrowUrl = require('../../../images/left-arrow.svg');

function Sidebar(props) {
  const sidebarClass = classNames({
    sidebar: true,
    'sidebar--contracted': !props.isExpanded
  });

  return (
    <section className={sidebarClass}>
      <div className="sidebar__header">
        <h3 className="sidebar__title">Sketch Files</h3>
        <div className="sidebar__icons">
          <a
            className="sidebar__add"
            onClick={props.newFile}
          >
            +
          </a>
          <a
            className="sidebar__contract"
            onClick={props.collapseSidebar}
          >
            <InlineSVG src={leftArrowUrl} />
          </a>
          <a
            className="sidebar__expand"
            onClick={props.expandSidebar}
          >
            <InlineSVG src={rightArrowUrl} />
          </a>
        </div>
      </div>
      <ul className="sidebar__file-list">
        {props.files.map(file => {
          let itemClass = classNames({
            'sidebar__file-item': true,
            'sidebar__file-item--selected': file.id === props.selectedFile.id
          });
          return (
            <li
              className={itemClass}
              key={file.id}
            >
              <a
                onClick={() => props.setSelectedFile(file.id)}
              >{file.name}</a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

Sidebar.propTypes = {
  files: PropTypes.array.isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  setSelectedFile: PropTypes.func.isRequired
};

export default Sidebar;
