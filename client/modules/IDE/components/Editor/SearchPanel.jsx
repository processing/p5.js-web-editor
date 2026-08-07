import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SearchQuery,
  setSearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
  openSearchPanel,
  closeSearchPanel,
  getSearchQuery
} from '@codemirror/search';
import { runScopeHandlers } from '@codemirror/view';
import MatchCaseSvg from '../../../../images/match-case.svg';
import RegexSvg from '../../../../images/regex.svg';
import ArrowSvg from '../../../../images/arrow.svg';
import CrossSvg from '../../../../images/cross.svg';
import CaretArrowSvg from '../../../../images/right-arrow.svg';

/**
 * Custom implementation of CodeMirror 6's built-in SearchPanel.
 */
export default function SearchPanel({ view, closePanel, isMobile }) {
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
  const [showReplace, setShowReplace] = useState(false);

  const searchFieldRef = useRef(null);
  const replaceFieldRef = useRef(null);

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
        view.focus();
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
      replace
    });
    if (!query.eq(lastQueryRef.current)) {
      lastQueryRef.current = query;
      view.dispatch({ effects: setSearchQuery.of(query) });
    }
  }, [view, search, replace, caseSensitive, regexp]);

  // Re-commit whenever any field changes (mirrors onchange/onkeyup -> commit()).
  useEffect(() => {
    commit();
  }, [commit]);

  // Focus + select the search field on mount, like the original's mount().
  useEffect(() => {
    searchFieldRef.current?.select();
  }, []);

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
      closePanel();
    }
  };

  return (
    <>
      {/* The <div> element TODO */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={`cm-search-panel ${isMobile ? 'mobile' : ''}`}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          aria-label="close"
          onClick={closePanel}
          className="cm-search-close"
        >
          <CrossSvg focusable="false" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="cm-search-toggle-replace"
          onClick={() => setShowReplace((s) => !s)}
          aria-expanded={showReplace}
          aria-controls="cm-search-replace-row"
          title={showReplace ? 'Hide replace' : 'Show replace'}
        >
          <CaretArrowSvg
            aria-hidden="true"
            style={{
              transform: showReplace ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.18s ease'
            }}
          />
        </button>
        <div className="cm-search-content">
          <div className="cm-search-row cm-search-find">
            <div className="cm-search-findContainer">
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
              <div className="cm-search-findOptions">
                <label htmlFor="cm-search-caseSensitive">
                  <input
                    id="cm-search-caseSensitive"
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                  <MatchCaseSvg focusable="false" aria-hidden="true" />
                </label>
                <label htmlFor="cm-search-regexp">
                  <input
                    id="cm-search-regexp"
                    type="checkbox"
                    checked={regexp}
                    onChange={(e) => setRegexp(e.target.checked)}
                  />
                  <RegexSvg focusable="false" aria-hidden="true" />
                </label>
              </div>
            </div>
            <button
              type="button"
              className="cm-search-button cm-search-next"
              onClick={() => view && findNext(view)}
            >
              <ArrowSvg aria-label="Find next search" />
            </button>
            <button
              type="button"
              className="cm-search-button cm-search-previous"
              onClick={() => view && findPrevious(view)}
            >
              <ArrowSvg aria-label="Find previous search" />
            </button>
          </div>
          {showReplace && (
            <div
              id="cm-search-replace-row"
              className="cm-search-row cm-search-replace"
            >
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
                className="cm-search-button"
                onClick={() => {
                  console.log('replace next');
                  if (view) replaceNext(view);
                }}
              >
                replace
              </button>
              <button
                className="cm-search-button"
                onClick={() => view && replaceAll(view)}
              >
                replace all
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

SearchPanel.propTypes = {
  view: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
    state: PropTypes.shape({}),
    focus: PropTypes.func.isRequired
  }),
  closePanel: PropTypes.func.isRequired,
  isMobile: PropTypes.bool
};

SearchPanel.defaultProps = {
  view: null,
  isMobile: false
};
