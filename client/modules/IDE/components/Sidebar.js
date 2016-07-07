import React, { PropTypes } from 'react';

function Sidebar(props) {
  return (
    <section className="sidebar">
      <ul className="sidebar__file-list">
        {props.files.map(file =>
          <li
            className="sidebar__file-item"
            key={file.id}
          >{file.name}</li>
        )}
      </ul>
    </section>
  );
}

Sidebar.propTypes = {
  files: PropTypes.array.isRequired
};

export default Sidebar;
