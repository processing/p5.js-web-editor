import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { createContext, useState } from 'react';

export const EditorKeyMapsContext = createContext();

export function EditorKeyMapProvider({ children }) {
  const [keyMaps, setKeyMaps] = useState({ tidy: 'Shift-Ctrl-F' });

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
