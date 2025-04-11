import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useEditorKeyMap } from './Editor/contexts';

function KeyboardShortcutItem({ desc, keyName }) {
  const [edit, setEdit] = useState(false);
  const pressedKeyCombination = useRef({});
  const inputRef = useRef(null);
  const { updateKeyMap, keyMaps } = useEditorKeyMap();

  if (!Object.keys(keyMaps).includes(keyName)) {
    return null;
  }

  const cancelEdit = () => {
    setEdit(false);
    pressedKeyCombination.current = {};
    inputRef.current.innerText = keyMaps[keyName];
  };

  const handleEdit = (state, key) => {
    setEdit(state);
    if (!state) {
      updateKeyMap(key, inputRef.current.innerText);
      cancelEdit();
    }
  };

  const handleKeyDown = (event) => {
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
    if (key.length === 1 && key.match(/[a-z]/i)) {
      key = key.toUpperCase();
    }

    pressedKeyCombination.current[key] = true;

    const allKeys = Object.keys(pressedKeyCombination.current).filter(
      (k) => !['Shift', 'Ctrl', 'Alt'].includes(k)
    );

    if (event.altKey) {
      allKeys.unshift('Alt');
    }
    if (event.ctrlKey) {
      allKeys.unshift('Ctrl');
    }
    if (event.shiftKey) {
      allKeys.unshift('Shift');
    }

    event.currentTarget.innerText = allKeys.join('-');
  };

  const handleKeyUp = (event) => {
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
    if (key.length === 1 && key.match(/[a-z]/i)) {
      key = key.toUpperCase();
    }

    delete pressedKeyCombination.current[key];
  };

  return (
    <li className="keyboard-shortcut-item">
      <button
        type="button"
        title="edit shortcut"
        className="keyboard-shortcut__edit"
        style={{
          display: edit ? 'none' : 'block'
        }}
        onClick={() => handleEdit(true, keyName)}
      >
        &#x270E;
      </button>
      <button
        type="button"
        title="cancel shortcut edit"
        className="keyboard-shortcut__edit"
        style={{
          display: !edit ? 'none' : 'block'
        }}
        onClick={cancelEdit}
      >
        &#10799;
      </button>
      <button
        type="button"
        title="save shortcut"
        className="keyboard-shortcut__edit"
        style={{
          display: !edit ? 'none' : 'block'
        }}
        onClick={() => handleEdit(false, keyName)}
      >
        &#10003;
      </button>
      <span
        className="keyboard-shortcut__command"
        role="textbox"
        ref={inputRef}
        tabIndex={0}
        contentEditable={edit}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {keyMaps[keyName]}
      </span>
      <span>{desc}</span>
    </li>
  );
}

KeyboardShortcutItem.propTypes = {
  desc: PropTypes.string.isRequired,
  keyName: PropTypes.string.isRequired
};

export default KeyboardShortcutItem;
