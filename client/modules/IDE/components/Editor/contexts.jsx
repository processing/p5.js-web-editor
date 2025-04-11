import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { createContext, useState } from 'react';
import { metaKey } from '../../../../utils/metaKey';

export const EditorKeyMapsContext = createContext();

export function EditorKeyMapProvider({ children }) {
  const [keyMaps, setKeyMaps] = useState({
    tidy: `Shift-${metaKey}-F`,
    findPersistent: `${metaKey}-F`,
    findPersistentNext: `${metaKey}-G`,
    findPersistentPrev: `Shift-${metaKey}-G`,
    colorPicker: `${metaKey}-K`
  });

  const updateKeyMap = (key, value) => {
    if (key in keyMaps) {
      setKeyMaps((prevKeyMaps) => ({
        ...prevKeyMaps,
        [key]: value
      }));
    }
  };

  return (
    <EditorKeyMapsContext.Provider value={{ keyMaps, updateKeyMap }}>
      {children}
    </EditorKeyMapsContext.Provider>
  );
}

EditorKeyMapProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useEditorKeyMap = () => {
  const context = useContext(EditorKeyMapsContext);
  if (!context) {
    throw new Error(
      'useEditorKeyMap must be used within a EditorKeyMapProvider'
    );
  }
  return context;
};
