/* eslint-disable */
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Define search commands. Depends on dialog.js or another
// implementation of the openDialog method.

// Replace works a little oddly -- it will do the replace on the next
// Ctrl-G (or whatever is bound to findNext) press. You prevent a
// replace by making sure the match is no longer selected when hitting
// Ctrl-G.

export default function(CodeMirror) {
  "use strict";

  function searchOverlay(query) {
    return {token: function(stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length || 1;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }};
  }

  function SearchState() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null;
    this.overlay = null;
    this.regexp = false;
    this.caseInsensitive = true;
    this.wholeWord = false;
    this.replaceStarted = false;
  }

  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }

  function getSearchCursor(cm, query, pos) {
    return cm.getSearchCursor(query, pos, getSearchState(cm).caseInsensitive);
  }

  function isMouseClick(event) {
    if(event.detail > 0) return true;
    else return false;
  }

  function persistentDialog(cm, text, deflt, onEnter, replaceOpened, onKeyDown) {
    var searchField = document.getElementsByClassName("CodeMirror-search-field")[0];
    if (!searchField) {
      cm.openDialog(text, onEnter, {
        value: deflt,
        selectValueOnOpen: true,
        closeOnEnter: false,
        onClose: function () {
          clearSearch(cm);
        },
        onKeyDown: onKeyDown,
        closeOnBlur: false
      });

      searchField = document.getElementById("Find-input-field");

      var dialog = document.getElementsByClassName("CodeMirror-dialog")[0];
      var closeButton = dialog.getElementsByClassName("close")[0];

      var state = getSearchState(cm);

      CodeMirror.on(searchField, "keyup", function (e) {
        if (e.keyCode === 13) {
          // If enter is pressed, then shift focus to replace field
          var state = getSearchState(cm);
          startSearch(cm, state, searchField.value);
          state.replaceStarted = true;
          cm.focus();
          CodeMirror.commands.findNext(cm);
          searchField.blur();
          replaceField.focus();
        }
        else if (e.keyCode !== 13 && searchField.value.length > 1) { // not enter and more than 1 character to search
          startSearch(cm, getSearchState(cm), searchField.value);
        } else if (searchField.value.length <= 1) {
          cm.display.wrapper.querySelector('.CodeMirror-search-results').innerText = 'No results';
        }
      });

      CodeMirror.on(closeButton, "click", function () {
        clearSearch(cm);
        dialog.parentNode.removeChild(dialog);
        cm.focus();
      });

      var upArrow = dialog.getElementsByClassName("up-arrow")[0];
      CodeMirror.on(upArrow, "click", function () {
        cm.focus();
        CodeMirror.commands.findPrev(cm);
        searchField.blur();
      });

      var downArrow = dialog.getElementsByClassName("down-arrow")[0];
      CodeMirror.on(downArrow, "click", function () {
        cm.focus();
        CodeMirror.commands.findNext(cm);
        searchField.blur();
      });

      var regexpButton = dialog.getElementsByClassName("CodeMirror-regexp-button")[0];
      CodeMirror.on(regexpButton, "click", function (event) {
        var state = getSearchState(cm);
        state.regexp = toggle(regexpButton);
        startSearch(cm, getSearchState(cm), searchField.value);
        if(isMouseClick(event)) searchField.focus();
      });

      toggle(regexpButton, state.regexp);

      var caseSensitiveButton = dialog.getElementsByClassName("CodeMirror-case-button")[0];
      CodeMirror.on(caseSensitiveButton, "click", function (event) {
        var state = getSearchState(cm);
        state.caseInsensitive = !toggle(caseSensitiveButton);
        startSearch(cm, getSearchState(cm), searchField.value);
        if(isMouseClick(event)) searchField.focus();
      });

      toggle(caseSensitiveButton, !state.caseInsensitive);

      var wholeWordButton = dialog.getElementsByClassName("CodeMirror-word-button")[0];
      CodeMirror.on(wholeWordButton, "click", function (event) {
        var state = getSearchState(cm);
        state.wholeWord = toggle(wholeWordButton);
        startSearch(cm, getSearchState(cm), searchField.value);
        if(isMouseClick(event)) searchField.focus();
      });

      toggle(wholeWordButton, state.wholeWord);

      function toggle(el, initialState) {
        var currentState, nextState;

        if (initialState == null) {
          currentState = el.getAttribute('aria-checked') === 'true';
          nextState = !currentState;
        } else {
          nextState = initialState;
        }
        
        el.setAttribute('aria-checked', nextState);
        return nextState;
      }

      function toggleReplace(open) {
        var replaceDivHeightOpened = "45px", replaceDivHeightClosed = "0px";
        var toggleButtonHeightOpened = "80px", toggleButtonHeightClosed = "40px";

        if (open) {
          replaceDiv.style.height = replaceDivHeightOpened;
          toggleReplaceBtnDiv.style.height = toggleButtonHeightOpened;
          showReplaceButton.style.height = toggleButtonHeightOpened;
          showReplaceButton.innerHTML = "▼";
        } else {
          replaceDiv.style.height = replaceDivHeightClosed;
          toggleReplaceBtnDiv.style.height = toggleButtonHeightClosed;
          showReplaceButton.style.height = toggleButtonHeightClosed;
          showReplaceButton.innerHTML = "►";
        }
      }

      var showReplaceButton = dialog.getElementsByClassName("CodeMirror-replace-toggle-button")[0];
      var toggleReplaceBtnDiv = dialog.getElementsByClassName("Toggle-replace-btn-div")[0];
      var replaceDiv = dialog.getElementsByClassName("CodeMirror-replace-div")[0];
      if (replaceOpened) {
        toggleReplace(true);
      }
      CodeMirror.on(showReplaceButton, "click", function () {
        if (replaceDiv.style.height === "0px") {
          toggleReplace(true);
        } else {
          toggleReplace(false);
        }
      });

      var replaceField = document.getElementById('Replace-input-field');
      CodeMirror.on(replaceField, "keyup", function (e) {
        if (!searchField.value) {
          searchField.focus();
          return;
        }
        var state = getSearchState(cm);
        var query = parseQuery(searchField.value, state);
        var withText = parseString(replaceField.value);
        if (e.keyCode === 13)  // if enter
        {
          var cursor = getSearchCursor(cm, query, cm.getCursor("from"));
          var match = cursor.findNext();
          cm.setSelection(cursor.from(), cursor.to());
          doReplace(match, cursor, query, withText);
        }
      })

      function doReplace(match, cursor, query, withText) {
        cursor.replace(typeof query == "string" ? withText :
          withText.replace(/\$(\d)/g, function(_, i) {return match[i];}));
        cursor.findNext();
        cm.focus();
        CodeMirror.commands.findNext(cm);
        searchField.blur();
      };

      var doReplaceButton = document.getElementById('Btn-replace');
      CodeMirror.on(doReplaceButton, "click", function(e) {
        if (!searchField.value) {
          searchField.focus();
          return;
        }
        var state = getSearchState(cm);
        var query = parseQuery(searchField.value, state);
        var withText = parseString(replaceField.value);
        if (state.replaceStarted) {
          var cursor = getSearchCursor(cm, query, cm.getCursor("from"));
          var match = cursor.findNext();
          cm.setSelection(cursor.from(), cursor.to());
          doReplace(match, cursor, query, withText);
        } else {
          startSearch(cm, state, searchField.value);
          state.replaceStarted = true;
          cm.focus();
          CodeMirror.commands.findNext(cm);
          searchField.blur();
        }
      })

      var doReplaceAllButton = document.getElementById('Btn-replace-all');
      CodeMirror.on(doReplaceAllButton, "click", function(e) {
        if (!searchField.value) {
          searchField.focus();
          return;
        }
        var state = getSearchState(cm);
        var query = parseQuery(searchField.value, state);
        var withText = parseString(replaceField.value);
        if (state.replaceStarted) {
          replaceAll(cm, query, withText);
          state.replaceStarted = false;
        } else {
          startSearch(cm, state, searchField.value);
          state.replaceStarted = true;
        }
      })

    } else {
      searchField.focus();
      searchField.select();
    }
  }

  function dialog(cm, text, shortText, deflt, f) {
    if (cm.openDialog) cm.openDialog(text, f, {value: deflt, selectValueOnOpen: true});
    else f(prompt(shortText, deflt));
  }

  function parseString(string) {
    return string.replace(/\\(.)/g, function(_, ch) {
      if (ch == "n") return "\n"
      if (ch == "r") return "\r"
      return ch
    })
  }

  /*
    Parses the query text and state and returns
    a RegExp ready for searching
  */
  function parseQuery(query, state) {
    var emptyQuery = 'x^'; // matches nothing

    if (query === '') { // empty string matches nothing
      query = emptyQuery;
    } else {
      if (state.regexp === false) {
        query = parseString(query);
        query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }

      if (state.wholeWord) {
        query += '\\b';
      }
    }

    var regexp;

    try {
      regexp = new RegExp(query, state.caseInsensitive ? "gi" : "g");
    } catch (e) {
      regexp = new RegExp(emptyQuery, 'g');
    }

    // If the resulting regexp will match everything, do not use it
    if (regexp.test('')) {
      return new RegExp(emptyQuery, 'g');
    }

    return regexp;
  }

  function startSearch(cm, state, originalQuery) {
    state.queryText = originalQuery;
    state.query = parseQuery(originalQuery, state);

    cm.removeOverlay(state.overlay, state.caseInsensitive);
    state.overlay = searchOverlay(state.query);
    cm.addOverlay(state.overlay);
    if (cm.showMatchesOnScrollbar) {
      if (state.annotate) { state.annotate.clear(); state.annotate = null; }
      state.annotate = cm.showMatchesOnScrollbar(state.query,  state.caseInsensitive);
    }
    if (originalQuery) {
      return findNext(cm, false);
    }
  }

  function doFindAndReplace(cm, rev, persistent, immediate, ignoreQuery, replaceOpened) {
    var state = getSearchState(cm);
    if (!ignoreQuery && state.query) {
      return findNext(cm, rev);
    }
    var q = cm.getSelection() || state.lastQuery;
    if (persistent && cm.openDialog) {
      var hiding = null;
      var searchNext = function(query, event) {
        CodeMirror.e_stop(event);
        if (!query) return;
        if (query != state.queryText) {
          startSearch(cm, state, query);
          state.posFrom = state.posTo = cm.getCursor();
        }
        if (hiding) hiding.style.opacity = 1
        findNext(cm, event.shiftKey, function(_, to) {
          var dialog
          if (to.line < 3 && document.querySelector &&
            (dialog = cm.display.wrapper.querySelector(".CodeMirror-dialog")) &&
            dialog.getBoundingClientRect().bottom - 4 > cm.cursorCoords(to, "window").top)
            (hiding = dialog).style.opacity = 1
        })
      };
      persistentDialog(cm, queryDialog, q, searchNext, replaceOpened, function(event, query) {
        var keyName = CodeMirror.keyName(event)
        var cmd = CodeMirror.keyMap[cm.getOption("keyMap")][keyName]
        if (!cmd) cmd = cm.getOption('extraKeys')[keyName]
        if (cmd == "findNext" || cmd == "findPrev" ||
          cmd == "findPersistentNext" || cmd == "findPersistentPrev") {
          CodeMirror.e_stop(event);
          startSearch(cm, getSearchState(cm), query);
          cm.execCommand(cmd);
        } else if (cmd == "find" || cmd == "findPersistent") {
          CodeMirror.e_stop(event);
          searchNext(query, event);
        }
      });
      if (immediate && q) {
        startSearch(cm, state, q);
        findNext(cm, rev);
      }
    } else {
      dialog(cm, queryDialog, "Search for:", q, function(query) {
        if (query && !state.query) cm.operation(function() {
          startSearch(cm, state, query);
          state.posFrom = state.posTo = cm.getCursor();
          findNext(cm, rev);
        });
      });
    }
  }

  function findNext(cm, rev, callback) {cm.operation(function() {
    var state = getSearchState(cm);
    var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
      if (!cursor.find(rev)) {
        cm.display.wrapper.querySelector('.CodeMirror-search-results').innerText = 'No results';
        return;
      }
    }
    cm.setSelection(cursor.from(), cursor.to());
    cm.scrollIntoView({from: cursor.from(), to: cursor.to()}, 60);
    state.posFrom = cursor.from(); state.posTo = cursor.to();
    var num_match = cm.state.search.annotate.matches.length;
    var next = cm.state.search.annotate.matches
      .findIndex(s => s.from.ch === cursor.from().ch && s.from.line === cursor.from().line) + 1;
    var text_match = next + '/' + num_match;
    cm.display.wrapper.querySelector('.CodeMirror-search-results').innerText = text_match;
    if (callback) callback(cursor.from(), cursor.to())
  });}

  function clearSearch(cm) {cm.operation(function() {
    var state = getSearchState(cm);
    state.lastQuery = state.queryText;
    state.replaceStarted = false;
    if (!state.query) return;
    state.query = state.queryText = null;
    cm.removeOverlay(state.overlay);
    if (state.annotate) { state.annotate.clear(); state.annotate = null; }
  });}

  function replaceAll(cm, query, text) {
    cm.operation(function() {
      for (var cursor = getSearchCursor(cm, query); cursor.findNext();) {
        if (typeof query != "string") {
          var match = cm.getRange(cursor.from(), cursor.to()).match(query);
          cursor.replace(text.replace(/\$(\d)/g, function(_, i) {return match[i];}));
        } else cursor.replace(text);
      }
    });
  }

  var queryDialog = `
    <div class="CodeMirror-find-popup-container">
      <div class="Toggle-replace-btn-div">
        <button
          title="Replace"
          aria-label="Replace"
          role="button"
          class="CodeMirror-search-modifier-button CodeMirror-replace-toggle-button"
        >
          <span aria-hidden="true" class="button">▶</span>
        </button>
      </div>
      <div class="CodeMirror-find-input-fields">
        <div class="CodeMirror-find-div">
          <div class="CodeMirror-find-input">
            <input id="Find-input-field" type="text" class="search-input CodeMirror-search-field" placeholder="Find in files" />
          </div>
          <div class="CodeMirror-find-controls">
            <div class="CodeMirror-search-modifiers button-wrap">
              <button
                title="Regular expression"
                aria-label="Regular expression"
                role="checkbox"
                class="CodeMirror-search-modifier-button CodeMirror-regexp-button"
              >
                <span aria-hidden="true" class="button">.*</span>
              </button>
              <button
                title="Case sensitive"
                aria-label="Case sensitive"
                role="checkbox"
                class="CodeMirror-search-modifier-button CodeMirror-case-button"
              >
                <span aria-hidden="true" class="button">Aa</span>
              </button>
              <button
                title="Whole words"
                aria-label="Whole words"
                role="checkbox"
                class="CodeMirror-search-modifier-button CodeMirror-word-button"
              >
                <span aria-hidden="true" class="button">" "</span>
              </button>
            </div>
            <div class="CodeMirror-search-nav">
              <p class="CodeMirror-search-results">No results</p>
              <button
                title="Previous"
                aria-label="Previous"
                class="CodeMirror-search-button icon up-arrow prev"
              >
              </button>
              <button
                title="Next"
                aria-label="Next"
                class="CodeMirror-search-button icon down-arrow next"
              >
              </button>
            </div>
            <div class="CodeMirror-close-button-container">
              <button
                title="Close"
                aria-label="Close"
                class="CodeMirror-close-button close icon">
              </button>
            </div>
          </div>
        </div>
        <div style="height: 0px; overflow: hidden;" class="CodeMirror-replace-div">
          <input id="Replace-input-field" type="text" placeholder="Text to replace" class="search-input CodeMirror-search-field"/>
          <div class="CodeMirror-replace-controls">
            <button
              title="Replace"
              aria-label="Replace"
              role="button"
              id="Btn-replace"
              class="CodeMirror-search-modifier-button CodeMirror-replace-button"
            >
              Replace
            </button>
            <button
              title="Replace All"
              aria-label="Replace All"
              role="button"
              id="Btn-replace-all"
              class="CodeMirror-search-modifier-button CodeMirror-replace-button"
            >
              Replace All
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  CodeMirror.commands.findPersistent = function(cm) {doFindAndReplace(cm, false, true, false, true, false);};
  CodeMirror.commands.findPersistentNext = function(cm) {doFindAndReplace(cm, false, true, false, true, false);};
  CodeMirror.commands.findPersistentPrev = function(cm) {doFindAndReplace(cm, false, true, false, true, false);};
  CodeMirror.commands.findNext = doFindAndReplace;
  CodeMirror.commands.findPrev = function(cm) {doFindAndReplace(cm, true);};
  CodeMirror.commands.clearSearch = clearSearch;
  CodeMirror.commands.replace = function(cm) { doFindAndReplace(cm, false, true, false, true, true); };
};
