import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ConsoleContext = createContext(null);

export function ConsoleProvider({ children }) {
  const [consoleEvents, setConsoleEvents] = useState([]);

  const dispatchConsoleEvent = useCallback((messages) => {
    setConsoleEvents((prev) => [...prev, ...messages]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleEvents([]);
  }, []);

  return (
    <ConsoleContext.Provider
      value={{
        consoleEvents,
        dispatchConsoleEvent,
        clearConsole
      }}
    >
      {children}
    </ConsoleContext.Provider>
  );
}

ConsoleProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}
