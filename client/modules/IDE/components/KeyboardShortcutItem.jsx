import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useEditorKeyMap } from './Editor/contexts';

function KeyboardShortcutItem({ shortcut, desc }) {
  const [edit, setEdit] = useState(false);
  const pressedKeyCombination = useRef({});
  const inputRef = useRef(null);
  const { updateKeyMap } = useEditorKeyMap();

  const handleEdit = (state) => {
    setEdit(state);
    if (state) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
      updateKeyMap('tidy', inputRef.current.innerText);
    }
  };

  return (
    <li className="keyboard-shortcut-item">
      <button type="button" title="edit" onClick={() => handleEdit(!edit)}>
        &#x270E;
      </button>
      <span
        className="keyboard-shortcut__command"
        role="textbox"
        ref={inputRef}
        tabIndex={0}
        contentEditable={edit}
        suppressContentEditableWarning
        onKeyDown={(event) => {
          if (!edit) return;

          event.preventDefault();
          event.stopPropagation();
          let { key } = event;
          if (key === 'Control') {
            key = 'Ctrl';
          }
          if (key === ' ') {
            key = 'Space';
          }

          pressedKeyCombination.current[key] = true;

          event.currentTarget.innerText = Object.keys(
            pressedKeyCombination.current
          ).join('-');
        }}
        onKeyUp={(event) => {
          if (!edit) return;
          event.preventDefault();
          event.stopPropagation();
          let { key } = event;
          if (key === 'Control') {
            key = 'Ctrl';
          }
          if (key === ' ') {
            key = 'Space';
          }

          delete pressedKeyCombination.current[key];
        }}
      >
        {shortcut}
      </span>
      <span>{desc}</span>
    </li>
  );
}

KeyboardShortcutItem.propTypes = {
  shortcut: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired
};

export default KeyboardShortcutItem;
