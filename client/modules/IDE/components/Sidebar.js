import React, { PropTypes } from 'react';
import classNames from 'classnames';

function Sidebar(props) {
  return (
    <nav className="sidebar" role="navigation" title="file-navigation">
      <ul className="sidebar__file-list" title="file-list">
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
