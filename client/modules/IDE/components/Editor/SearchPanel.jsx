import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SearchQuery,
  setSearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
  selectMatches,
  openSearchPanel,
  closeSearchPanel,
  getSearchQuery
} from '@codemirror/search';
import { runScopeHandlers } from '@codemirror/view';

/**
 * Custom implementation of CodeMirror 6's built-in SearchPanel.
 *
 * Usage:
 *   <SearchPanel view={editorViewInstance} />
 *
 * `view` must be a live EditorView instance (e.g. from a ref on your editor).
 * The panel is fully controlled by React state and pushes changes into
 * CodeMirror via the `setSearchQuery` effect, mirroring the original
 * plugin's `commit()` behavior.
 */
export default function SearchPanel({ view }) {
  // Seed initial state from whatever query is already active in the editor,
  // falling back to an empty query.
  const initialQuery = view
    ? getSearchQuery(view.state)
    : new SearchQuery({ search: '' });

  const [search, setSearch] = useState(initialQuery.search);
  const [replace, setReplace] = useState(initialQuery.replace);
  const [caseSensitive, setCaseSensitive] = useState(
    initialQuery.caseSensitive
  );
  const [regexp, setRegexp] = useState(initialQuery.regexp);
  const [wholeWord, setWholeWord] = useState(initialQuery.wholeWord);

  const searchFieldRef = useRef(null);
  const replaceFieldRef = useRef(null);
  const panelRef = useRef(null);

  // Keep a ref of the "last committed" query so we can avoid redundant dispatches,
  // same as the original's `this.query` comparison.
  const lastQueryRef = useRef(initialQuery);

  useEffect(() => {
    if (view) {
      openSearchPanel(view);
    }

    return () => {
      if (view) {
        closeSearchPanel(view);
      }
    };
  }, [view]);

  // Push the current form state into the editor as a SearchQuery.
  const commit = useCallback(() => {
    if (!view) return;
    const query = new SearchQuery({
      search,
      caseSensitive,
      regexp,
      wholeWord,
      replace
    });
    if (!query.eq(lastQueryRef.current)) {
      lastQueryRef.current = query;
      console.log('dispatching setSearchQuery', query);
      view.dispatch({ effects: setSearchQuery.of(query) });
    }
  }, [view, search, replace, caseSensitive, regexp, wholeWord]);

  // Re-commit whenever any field changes (mirrors onchange/onkeyup -> commit()).
  useEffect(() => {
    commit();
  }, [commit]);

  // Listen for external changes to the search query (e.g. triggered elsewhere
  // in the app) and sync the form fields back, mirroring `setQuery()`.
  useEffect(() => {
    if (!view) return;

    const checkForExternalChange = () => {
      const q = getSearchQuery(view.state);
      if (!q.eq(lastQueryRef.current)) {
        lastQueryRef.current = q;
        setSearch(q.search);
        setReplace(q.replace);
        setCaseSensitive(q.caseSensitive);
        setRegexp(q.regexp);
        setWholeWord(q.wholeWord);
      }
    };

    // CodeMirror doesn't give us a plain event emitter here, so if you're
    // driving `view` from elsewhere in your app, call this after any
    // dispatch that might change the search query. A simple approach is to
    // expose an EditorView.updateListener extension that calls a callback
    // passed down as a prop; wire that up in place of this stub if needed.
    checkForExternalChange();
  }, [view]);

  // Focus + select the search field on mount, like the original's mount().
  useEffect(() => {
    searchFieldRef.current?.select();
  }, []);

  const handleClose = () => {
    if (view) closeSearchPanel(view);
  };

  const handleKeyDown = (e) => {
    if (view && runScopeHandlers(view, e.nativeEvent, 'search-panel')) {
      e.preventDefault();
      return;
    }
    if (e.keyCode === 13 && e.target === searchFieldRef.current) {
      e.preventDefault();
      if (view) (e.shiftKey ? findPrevious : findNext)(view);
    } else if (e.keyCode === 13 && e.target === replaceFieldRef.current) {
      e.preventDefault();
      if (view) replaceNext(view);
    } else if (e.keyCode === 27) {
      // Escape closes the panel
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <>
      {/* The <div> element TODO */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onKeyDown={handleKeyDown} ref={panelRef}>
        <form className="cm-search-panel" onSubmit={(e) => e.preventDefault()}>
          <button
            type="button"
            aria-label="close"
            onClick={handleClose}
            className="cm-search-panel-close-button"
          >
            ×
          </button>

          <div className="cm-search-panel-row">
            <input
              ref={searchFieldRef}
              type="text"
              name="search"
              className="cm-textfield"
              placeholder="Find"
              aria-label="Find"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              className="cm-button"
              onClick={() => view && findNext(view)}
            >
              next
            </button>
            <button
              type="button"
              className="cm-button"
              onClick={() => view && findPrevious(view)}
            >
              previous
            </button>
            <button
              type="button"
              className="cm-button"
              onClick={() => view && selectMatches(view)}
            >
              all
            </button>

            <label htmlFor="cm-search-case-sensitive">
              <input
                id="cm-search-case-sensitive"
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              match case
            </label>
            <label htmlFor="cm-search-regexp">
              <input
                id="cm-search-regexp"
                type="checkbox"
                checked={regexp}
                onChange={(e) => setRegexp(e.target.checked)}
              />
              regexp
            </label>
          </div>

          <div className="cm-search-panel-row">
            <input
              ref={replaceFieldRef}
              type="text"
              name="replace"
              className="cm-textfield"
              placeholder="Replace"
              aria-label="Replace"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
            />
            <button
              type="button"
              className="cm-button"
              onClick={() => view && replaceNext(view)}
            >
              replace
            </button>
            <button
              type="button"
              className="cm-button"
              onClick={() => view && replaceAll(view)}
            >
              replace all
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

SearchPanel.propTypes = {
  view: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
    state: PropTypes.shape({})
  }).isRequired
};
