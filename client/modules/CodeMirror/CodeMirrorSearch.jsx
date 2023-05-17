import {
  getSearchQuery,
  setSearchQuery,
  SearchQuery,
  replaceNext,
  replaceAll,
  findNext,
  findPrevious,
  selectMatches,
  closeSearchPanel
} from '@codemirror/search';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExitIcon,
  PlayIcon,
  DownArrowIcon,
  UpArrowIcon
} from '../../common/icons';

// TODO: is this a valid check?
function isMouseClick(event) {
  return event.detail > 0;
}

// TODO: codemirror event handlers won't take effect when the focus is on the react element.
// Expand these keymaps: https://github.com/codemirror/search/blob/3c1346e213a9635f56f92b23066ea0638319de25/src/search.ts#L576
// https://github.com/codemirror/view/blob/772e5a5102d96c25f54c4b9516e6a2d845336d65/src/keymap.ts#L34
// https://github.com/codemirror/dev/issues/865

// TODO: number of hits
// https://discuss.codemirror.net/t/get-number-of-hits-of-searchquery/3939
/*
state.posFrom = cursor.from();
    state.posTo = cursor.to();
    var num_match = cm.state.search.annotate.matches.length;
    var next = cm.state.search.annotate.matches
      .findIndex(s => s.from.ch === cursor.from().ch && s.from.line === cursor.from().line) + 1;
    var text_match = next + '/' + num_match;
    cm.display.wrapper.querySelector('.CodeMirror-search-results').innerText = text_match;
 */

// TODO: v5 showMatchesOnScrollbar
// https://codemirror.net/5/addon/search/matchesonscrollbar.js
// https://codemirror.net/5/doc/manual.html

/**
 * @param {import("@codemirror/view").EditorView} editor
 * @return {JSX.Element}
 */
function CodeMirrorSearch({ editor }) {
  const { t } = useTranslation();

  const [modifiers, setModifiers] = useState({
    caseSensitive: false,
    regexp: false,
    wholeWord: false
  });

  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const [isReplace, setIsReplace] = useState(false);

  const searchQuery = getSearchQuery(editor.state);

  const searchRef = useRef(null);
  const replaceRef = useRef(null);

  console.log(searchQuery);

  console.log(editor.state);

  console.log(editor.state.search);

  useEffect(() => {
    const nextQuery = new SearchQuery({
      search: searchText,
      replace: isReplace ? replaceText : '',
      ...modifiers
    });
    editor.dispatch({
      effects: setSearchQuery.of(nextQuery)
    });
    console.log(nextQuery);
    console.log(nextQuery.getCursor(editor.state));
    // TODO: throttle?
    // TODO: this makes them all "selected" but I just want "highlighted"
    // selectMatches(editor);
  }, [modifiers, searchText, replaceText, isReplace]);

  const createToggleButton = (field, label, children) => (
    <button
      title={label}
      aria-label={label}
      role="checkbox"
      aria-checked={searchQuery[field]}
      className="CodeMirror-search-modifier-button"
      onClick={(event) => {
        setModifiers((prevState) => ({
          ...prevState,
          [field]: !prevState[field]
        }));
        if (isMouseClick(event)) {
          searchRef.current?.focus();
        }
      }}
    >
      <span aria-hidden="true" className="button">
        {children}
      </span>
    </button>
  );

  const handleReplace = (operation) => {
    if (!replaceText) {
      replaceRef.current?.focus();
      return;
    }
    if (!searchText.length > 1) {
      searchRef.current?.focus();
      return;
    }
    editor.focus();
    operation(editor);
  };

  const handlePrevNext = (operation) => {
    if (!searchText.length > 1) {
      searchRef.current?.focus();
      return;
    }
    editor.focus();
    operation(editor);
  };

  const handleReplaceEnter = () => {
    // TODO: flips between replacing the selected and selecting the next
    /*
    var state = getSearchState(cm);
      var query = parseQuery(searchField.value, state);
      var withText = parseString(replaceField.value);
      if (e.keyCode === 13)  // if enter
      {
        var cursor = getSearchCursor(cm, query, cm.getCursor("from"));
        var start = cursor.from();
        var match = cursor.findNext();
        if (!match) {
          cursor = getSearchCursor(cm, query);
          if (!(match = cursor.findNext()) || (start && cursor.from().line == start.line && cursor.from().ch == start.ch)) return;
        }
        cm.setSelection(cursor.from(), cursor.to());
        state.replaceStarted = true;
        doReplace(match, cursor, query, withText);
     */
  };

  return (
    <div className="CodeMirror-find-popup-container">
      <div id="Btn-Toggle-replace-div" className="Toggle-replace-btn-div">
        <button
          title={t('CodemirrorFindAndReplace.ToggleReplace')}
          aria-label={t('CodemirrorFindAndReplace.ToggleReplace')}
          id="Btn-Toggle-replace"
          className="CodeMirror-replace-toggle-button"
          onClick={() => setIsReplace((prevState) => !prevState)}
        >
          <span aria-hidden="true" className="button">
            <PlayIcon style={isReplace ? { transform: 'rotate(90deg)' } : {}} />
          </span>
        </button>
      </div>
      <div className="CodeMirror-search-inputs">
        <div className="CodeMirror-find-input">
          <form onSubmit={() => handlePrevNext(findNext)}>
            <input
              id="Find-input-field"
              type="text"
              className="search-input CodeMirror-search-field"
              placeholder={t('CodemirrorFindAndReplace.FindPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              ref={searchRef}
            />
          </form>
        </div>
        <div
          style={{ display: isReplace ? 'block' : 'none' }}
          id="Replace-input-div"
          className="CodeMirror-replace-input"
        >
          <form onSubmit={() => handleReplaceEnter()}>
            <input
              id="Replace-input-field"
              type="text"
              placeholder={t('CodemirrorFindAndReplace.ReplacePlaceholder')}
              className="search-input CodeMirror-search-field"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              ref={replaceRef}
            />
          </form>
        </div>
      </div>
      <div className="CodeMirror-search-controls">
        <div
          id="Replace-controls-div"
          className="CodeMirror-replace-controls"
          style={{ display: isReplace ? 'flex' : 'none' }}
        >
          <button
            title={t('CodemirrorFindAndReplace.Replace')}
            aria-label={t('CodemirrorFindAndReplace.Replace')}
            id="Btn-replace"
            className="CodeMirror-search-modifier-button CodeMirror-replace-button"
            onClick={() => handleReplace(replaceNext)}
          >
            {t('CodemirrorFindAndReplace.Replace')}
          </button>
          <button
            title={t('CodemirrorFindAndReplace.ReplaceAll')}
            aria-label={t('CodemirrorFindAndReplace.ReplaceAll')}
            id="Btn-replace-all"
            className="CodeMirror-search-modifier-button CodeMirror-replace-button"
            onClick={() => handleReplace(replaceAll)}
          >
            {t('CodemirrorFindAndReplace.ReplaceAll')}
          </button>
        </div>
        <div className="CodeMirror-find-controls">
          <div className="CodeMirror-search-modifiers button-wrap">
            {createToggleButton(
              'regexp',
              t('CodemirrorFindAndReplace.Regex'),
              '.*'
            )}
            {createToggleButton(
              'caseSensitive',
              t('CodemirrorFindAndReplace.CaseSensitive'),
              'Aa'
            )}
            {createToggleButton(
              'wholeWord',
              t('CodemirrorFindAndReplace.WholeWords'),
              '" "'
            )}
          </div>
          <div className="CodeMirror-search-nav">
            <p className="CodeMirror-search-results">
              {t('CodemirrorFindAndReplace.NoResults')}
            </p>
            <button
              title={t('CodemirrorFindAndReplace.Previous')}
              aria-label={t('CodemirrorFindAndReplace.Previous')}
              className="CodeMirror-search-button icon up-arrow prev"
              onClick={() => {
                editor.focus();
                findPrevious(editor);
              }}
            >
              <UpArrowIcon />
            </button>
            <button
              title={t('CodemirrorFindAndReplace.Next')}
              aria-label={t('CodemirrorFindAndReplace.Next')}
              className="CodeMirror-search-button icon down-arrow next"
              onClick={() => {
                editor.focus();
                findNext(editor);
              }}
            >
              <DownArrowIcon />
            </button>
          </div>
          <div className="CodeMirror-close-button-container">
            <button
              title={t('CodemirrorFindAndReplace.Close')}
              aria-label={t('CodemirrorFindAndReplace.Close')}
              className="CodeMirror-close-button close icon"
              onClick={() => {
                closeSearchPanel(editor);
              }}
            >
              <ExitIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CodeMirrorSearch.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  editor: PropTypes.object.isRequired
};

export default CodeMirrorSearch;
