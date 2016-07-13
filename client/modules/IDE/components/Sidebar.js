import React, { PropTypes } from 'react';
import classNames from 'classnames';

function Sidebar(props) {
  return (
    <section className="sidebar">
      <div className="sidebar__header">
        <h3 className="sidebar__title">Sketch Files</h3>
        <a
          className="sidebar__add"
          onClick={props.newFile}
        >
          +
        </a>
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
