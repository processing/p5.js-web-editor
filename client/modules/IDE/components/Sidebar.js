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
    <nav className={sidebarClass} title="file-navigation" role="navigation">
      <div className="sidebar__header">
        <h3 className="sidebar__title">Sketch Files</h3>
        <div className="sidebar__icons">
          <button
            aria-label="add file"
            className="sidebar__add"
            onClick={props.newFile}
          >
            +
          </button>
          <button
            aria-label="collapse file navigation"
            className="sidebar__contract"
            onClick={props.collapseSidebar}
          >
            <InlineSVG src={leftArrowUrl} />
          </button>
          <button
            aria-label="expand file navigation"
            className="sidebar__expand"
            onClick={props.expandSidebar}
          >
            <InlineSVG src={rightArrowUrl} />
          </button>
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
    </nav>
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
