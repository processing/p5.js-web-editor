/* eslint-disable */

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Modified for p5.js-web-editor

// declare global: DOMRect

// The first function (mod) is a wrapper to support different JavaScript environments.
// The second function (inside) contains the actual implementation.
import CodeMirror from 'codemirror';

(function (mod) {
  if (typeof exports == 'object' && typeof module == 'object')
    // CommonJS
    mod(require('codemirror'));
  else if (typeof define == 'function' && define.amd)
    // AMD
    define(['codemirror'], mod);
  // Plain browser env
  else mod(CodeMirror);

  // This part uptill here makes the code compatible with multiple JavaScript environments, so it can run in different places
})(function (CodeMirror) {
  'use strict';

  var HINT_ELEMENT_CLASS = 'CodeMirror-hint';
  var ACTIVE_HINT_ELEMENT_CLASS = 'CodeMirror-hint-active';

  // This is the old interface, kept around for now to stay
  // backwards-compatible.
  CodeMirror.showHint = function (cm, getHints, options) {
    if (!getHints) return cm.showHint(options); // if not getHints function passed, it assumes youre using the newer interface
    // restructured options to call the new c.showHint() method
    if (options && options.async) getHints.async = true;
    var newOpts = { hint: getHints };
    if (options) for (var prop in options) newOpts[prop] = options[prop];
    return cm.showHint(newOpts);
  };

  // this adds a method called showHint to every cm editor instance (editor.showHint())
  CodeMirror.defineExtension('showHint', function (options) {
    options = parseOptions(this, this.getCursor('start'), options);
    var selections = this.listSelections();
    if (selections.length > 1) return;
    // By default, don't allow completion when something is selected.
    // A hint function can have a `supportsSelection` property to
    // indicate that it can handle selections.
    if (this.somethingSelected()) {
      if (!options.hint.supportsSelection) return;
      // Don't try with cross-line selections
      // if selection spans multiple lines, bail out
      for (var i = 0; i < selections.length; i++)
        if (selections[i].head.line != selections[i].anchor.line) return;
    }

    if (this.state.completionActive) this.state.completionActive.close(); // close an already active autocomplete session if active
    // create a new completion object and saves it to this.state.completionActive
    var completion = (this.state.completionActive = new Completion(
      this,
      options
    ));
    if (!completion.options.hint) return; // safety check to ensure hint is valid

    CodeMirror.signal(this, 'startCompletion', this); // emits a signal; fires a startCompletion event on editor instance
    completion.update(true);
  });

  CodeMirror.defineExtension('closeHint', function () {
    if (this.state.completionActive) this.state.completionActive.close();
  });

  // defines a constructor function
  function Completion(cm, options) {
    this.cm = cm;
    this.options = options;
    this.widget = null; // will hold a reference to the dropdown menu that shows suggestions
    this.debounce = 0;
    this.tick = 0;
    this.startPos = this.cm.getCursor('start'); // startPos is a {line,ch} object used to remember where hinting started
    // startLen is the len of the line minus length of any selected text
    this.startLen =
      this.cm.getLine(this.startPos.line).length -
      this.cm.getSelection().length;

    if (this.options.updateOnCursorActivity) {
      var self = this; // stores ref to this as self so it can be accessed inside the nested function
      // adds an event listener to the editor; called when the cursor moves
      cm.on(
        'cursorActivity',
        (this.activityFunc = function () {
          self.cursorActivity();
        })
      );
    }
  }

  var requestAnimationFrame =
    window.requestAnimationFrame ||
    function (fn) {
      return setTimeout(fn, 1000 / 60);
    };
  var cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  Completion.prototype = {
    close: function () {
      if (!this.active()) return;
      this.cm.state.completionActive = null;
      this.tick = null;
      // removes the current activity listener
      if (this.options.updateOnCursorActivity) {
        this.cm.off('cursorActivity', this.activityFunc);
      }
      // signals and removes the widget
      if (this.widget && this.data) CodeMirror.signal(this.data, 'close');
      if (this.widget) this.widget.close();
      // emits a completition end event
      CodeMirror.signal(this.cm, 'endCompletion', this.cm);
    },

    active: function () {
      return this.cm.state.completionActive == this;
    },

    pick: function (data, i) {
      // selects an item from the suggestion list
      var completion = data.list[i],
        self = this;

      this.cm.operation(function () {
        const name = completion.item?.text;

        if (completion.hint) {
          completion.hint(self.cm, data, completion);
        } else {
          self.cm.replaceRange(
            getText(completion),
            completion.from || data.from,
            completion.to || data.to,
            'complete'
          );
        }
        // signals that a hint was picked and scrolls to it
        CodeMirror.signal(data, 'pick', completion);
        self.cm.scrollIntoView();
      });
      // closes widget if closeOnPick is enabled
      if (this.options.closeOnPick) {
        this.close();
      }
    },

    cursorActivity: function () {
      // if a debounce is scheduled, cancel it to avoid outdated updates
      if (this.debounce) {
        cancelAnimationFrame(this.debounce);
        this.debounce = 0;
      }

      var identStart = this.startPos;
      if (this.data) {
        identStart = this.data.from;
      }

      var pos = this.cm.getCursor(),
        line = this.cm.getLine(pos.line);
      if (
        pos.line != this.startPos.line ||
        line.length - pos.ch != this.startLen - this.startPos.ch ||
        pos.ch < identStart.ch ||
        this.cm.somethingSelected() ||
        !pos.ch ||
        this.options.closeCharacters.test(line.charAt(pos.ch - 1))
      ) {
        this.close();
      } else {
        var self = this;
        this.debounce = requestAnimationFrame(function () {
          self.update();
        });
        if (this.widget) this.widget.disable();
      }
    },

    update: function (first) {
      if (this.tick == null) return;
      var self = this,
        myTick = ++this.tick;
      fetchHints(this.options.hint, this.cm, this.options, function (data) {
        if (self.tick == myTick) self.finishUpdate(data, first);
      });
    },

    finishUpdate: function (data, first) {
      if (this.data) CodeMirror.signal(this.data, 'update');

      var picked =
        (this.widget && this.widget.picked) ||
        (first && this.options.completeSingle);
      if (this.widget) this.widget.close();

      this.data = data;

      if (data && data.list.length) {
        if (picked && data.list.length == 1) {
          this.pick(data, 0);
        } else {
          this.widget = new Widget(this, data);
          CodeMirror.signal(data, 'shown');
        }
      }
    }
  };

  function parseOptions(cm, pos, options) {
    var editor = cm.options.hintOptions;
    var out = {};
    // copies all default hint settings into out
    for (var prop in defaultOptions) out[prop] = defaultOptions[prop];
    if (editor)
      for (var prop in editor)
        if (editor[prop] !== undefined) out[prop] = editor[prop];
    if (options)
      for (var prop in options)
        if (options[prop] !== undefined) out[prop] = options[prop];
    if (out.hint.resolve) out.hint = out.hint.resolve(cm, pos);
    return out;
  }
  // extracts the visible text from a completion entry
  function getText(completion) {
    if (typeof completion === 'string') return completion;
    else return completion.item.text;
  }

  // builds a key mapping object to define keyboard behavior for autocomplete
  function buildKeyMap(completion, handle) {
    var baseMap = {
      Up: function () {
        handle.moveFocus(-1);
      },
      Down: function () {
        handle.moveFocus(1);
      },
      PageUp: function () {
        handle.moveFocus(-handle.menuSize() + 1, true);
      },
      PageDown: function () {
        handle.moveFocus(handle.menuSize() - 1, true);
      },
      Home: function () {
        handle.setFocus(0);
      },
      End: function () {
        handle.setFocus(handle.length - 1);
      },
      Enter: handle.pick,
      Tab: handle.pick,
      Esc: handle.close
    };
    // checks if the user is on macOS and adds shortcuts accordingly
    var mac = /Mac/.test(navigator.platform);

    if (mac) {
      baseMap['Ctrl-P'] = function () {
        handle.moveFocus(-1);
      };
      baseMap['Ctrl-N'] = function () {
        handle.moveFocus(1);
      };
    }

    // user defined custom key bindings
    var custom = completion.options.customKeys;
    var ourMap = custom ? {} : baseMap;
    function addBinding(key, val) {
      var bound;
      if (typeof val != 'string')
        bound = function (cm) {
          return val(cm, handle);
        };
      // This mechanism is deprecated
      else if (baseMap.hasOwnProperty(val)) bound = baseMap[val];
      else bound = val;
      ourMap[key] = bound;
    }
    // apply all custom key bindings and extraKeys
    if (custom)
      for (var key in custom)
        if (custom.hasOwnProperty(key)) addBinding(key, custom[key]);
    var extra = completion.options.extraKeys;
    if (extra)
      for (var key in extra)
        if (extra.hasOwnProperty(key)) addBinding(key, extra[key]);
    return ourMap;
  }

  // hintsElement is the parent for hints and el is the clicked element within that container
  function displayHint(name, type, p5, isBlacklistedFunction) {
    const linkOrPlaceholder = p5
      ? `<a href="https://p5js.org/reference/p5/${
          typeof p5 === 'string' ? p5 : name
        }" role="link" onclick="event.stopPropagation()" target="_blank">
      <span class="hint-hidden">open ${name} reference</span>
      <span aria-hidden="true" class="arrow-icon">➔</span>
    </a>`
      : `<span class="no-link-placeholder">
      <span class="hint-hidden">no reference for ${name}</span>
    </span>`;

    const hintHTML = `<div class="hint-main">
    <span class="${type}-name hint-name">${name}</span>
    <span class="hint-type">${type}</span>
    ${linkOrPlaceholder}
  </div>`;

    if (isBlacklistedFunction) {
      return `<div class="hint-container has-warning">
    ${hintHTML}
    <div class="blacklist-warning">⚠️use with caution in this context</div>
  </div>`;
    } else {
      return `<div class="hint-container">${hintHTML}</div>`;
    }
  }

  function getInlineHintSuggestion(cm, focus, token) {
    let tokenLength = token.string.length;
    if (token.string === '.') {
      tokenLength -= 1;
    }
    const name = focus.item?.text;
    const suggestionItem = focus.item;
    // builds the remainder of the suggestion excluding what user already typed
    const baseCompletion = `<span class="inline-hinter-suggestion">${suggestionItem.text.slice(
      tokenLength
    )}</span>`;
    if (suggestionItem.type !== 'fun') return baseCompletion;

    // for functions
    return (
      baseCompletion +
      '<span class="inline-hinter-suggestion-light">(' +
      (suggestionItem.params && suggestionItem.params.length
        ? suggestionItem.params.map(({ p, o }) => (o ? `[${p}]` : p)).join(', ')
        : '') +
      ')</span>'
    );
  }

  // clears existing inline hint (like the part is suggested)
  function removeInlineHint(cm) {
    if (cm.state.inlineHint) {
      cm.state.inlineHint.clear();
      cm.state.inlineHint = null;
    }
  }

  function changeInlineHint(cm, focus) {
    removeInlineHint(cm);

    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);

    if (token && focus.item) {
      const suggestionHTML = getInlineHintSuggestion(cm, focus, token);

      const widgetElement = document.createElement('span');
      widgetElement.className = 'autocomplete-inline-hinter';
      widgetElement.innerHTML = suggestionHTML;

      const widget = cm.setBookmark(cursor, { widget: widgetElement });
      cm.state.inlineHint = widget;
      cm.setCursor(cursor);
    }
  }

  // defines the autocomplete dropdown ui; renders the suggestions
  // completion = the autocomplete context having cm and options
  // data = object with the list of suggestions
  function Widget(completion, data) {
    this.id = 'cm-complete-' + Math.floor(Math.random(1e6));
    this.completion = completion;
    this.data = data;
    this.picked = false;
    var widget = this,
      cm = completion.cm;
    var ownerDocument = cm.getInputField().ownerDocument;
    var parentWindow = ownerDocument.defaultView || ownerDocument.parentWindow;

    var fontSize = completion.options._fontSize;

    var hints = (this.hints = ownerDocument.createElement('ul'));
    hints.setAttribute('role', 'listbox');
    hints.setAttribute('aria-expanded', 'true');
    hints.id = this.id;
    var theme = completion.cm.options.theme;
    hints.className = 'CodeMirror-hints ' + theme;
    this.selectedHint = data.selectedHint || 0;

    // Show inline hint
    changeInlineHint(cm, data.list[this.selectedHint]);

    var completions = data.list;
    for (var i = 0; i < completions.length; ++i) {
      const cur = completions[i];

      const elt = ownerDocument.createElement('li');
      elt.className =
        HINT_ELEMENT_CLASS +
        (i !== this.selectedHint ? '' : ' ' + ACTIVE_HINT_ELEMENT_CLASS) +
        (cur.isBlacklisted ? ' blacklisted' : '');

      if (cur.className != null)
        elt.className = cur.className + ' ' + elt.className;

      if (i === this.selectedHint) elt.setAttribute('aria-selected', 'true');
      elt.id = this.id + '-' + i;
      elt.setAttribute('role', 'option');
      elt.hintId = i;

      if (cur.render) {
        cur.render(elt, data, cur);
      } else {
        const name = getText(cur);
        if (cur.item && cur.item.type) {
          cur.displayText = displayHint(
            name,
            cur.item.type,
            cur.item.p5,
            cur.isBlacklisted
          );
        }

        elt.innerHTML =
          cur.displayText || `<span class="plain-hint-item">${name}</span>`;
      }

      hints.appendChild(elt);
    }

    var container = completion.options.container || ownerDocument.body;
    var pos = cm.cursorCoords(
      completion.options.alignWithWord ? data.from : null
    );
    var left = pos.left,
      top = pos.bottom,
      below = true;
    var offsetLeft = 0,
      offsetTop = 0;
    if (container !== ownerDocument.body) {
      // We offset the cursor position because left and top are relative to the offsetParent's top left corner.
      var isContainerPositioned =
        ['absolute', 'relative', 'fixed'].indexOf(
          parentWindow.getComputedStyle(container).position
        ) !== -1;
      var offsetParent = isContainerPositioned
        ? container
        : container.offsetParent;
      var offsetParentPosition = offsetParent.getBoundingClientRect();
      var bodyPosition = ownerDocument.body.getBoundingClientRect();
      offsetLeft =
        offsetParentPosition.left - bodyPosition.left - offsetParent.scrollLeft;
      offsetTop =
        offsetParentPosition.top - bodyPosition.top - offsetParent.scrollTop;
    }
    hints.style.left = left - offsetLeft + 'px';
    hints.style.top = top - offsetTop + 'px';

    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
    var winW =
      parentWindow.innerWidth ||
      Math.max(
        ownerDocument.body.offsetWidth,
        ownerDocument.documentElement.offsetWidth
      );
    var winH =
      parentWindow.innerHeight ||
      Math.max(
        ownerDocument.body.offsetHeight,
        ownerDocument.documentElement.offsetHeight
      );
    container.appendChild(hints);
    cm.getInputField().setAttribute('aria-autocomplete', 'list');
    cm.getInputField().setAttribute('aria-owns', this.id);
    cm.getInputField().setAttribute(
      'aria-activedescendant',
      this.id + '-' + this.selectedHint
    );

    var box = completion.options.moveOnOverlap
      ? hints.getBoundingClientRect()
      : new DOMRect();
    var scrolls = completion.options.paddingForScrollbar
      ? hints.scrollHeight > hints.clientHeight + 1
      : false;

    // Compute in the timeout to avoid reflow on init
    var startScroll;
    setTimeout(function () {
      startScroll = cm.getScrollInfo();
    });

    var overlapY = box.bottom - winH;
    if (overlapY > 0) {
      var height = box.bottom - box.top,
        curTop = pos.top - (pos.bottom - box.top);
      if (curTop - height > 0) {
        // Fits above cursor
        hints.style.top = (top = pos.top - height - offsetTop) + 'px';
        below = false;
      } else if (height > winH) {
        hints.style.height = winH - 5 + 'px';
        hints.style.top = (top = pos.bottom - box.top - offsetTop) + 'px';
        var cursor = cm.getCursor();
        if (data.from.ch != cursor.ch) {
          pos = cm.cursorCoords(cursor);
          hints.style.left = (left = pos.left - offsetLeft) + 'px';
          box = hints.getBoundingClientRect();
        }
      }
    }
    var overlapX = box.right - winW;
    if (scrolls) overlapX += cm.display.nativeBarWidth;
    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        hints.style.width = winW - 5 + 'px';
        overlapX -= box.right - box.left - winW;
      }
      hints.style.left = (left = pos.left - overlapX - offsetLeft) + 'px';
    }
    // if (scrolls) for (var node = hints.firstChild; node; node = node.nextSibling)
    //   node.style.paddingRight = cm.display.nativeBarWidth + "px"

    cm.addKeyMap(
      (this.keyMap = buildKeyMap(completion, {
        moveFocus: function (n, avoidWrap) {
          return widget.changeActive(widget.selectedHint + n, avoidWrap);
        },
        setFocus: function (n) {
          return widget.changeActive(n);
        },
        menuSize: function () {
          return widget.screenAmount();
        },
        length: completions.length,
        close: function () {
          completion.close();
        },
        pick: function () {
          widget.pick();
        },
        data: data
      }))
    );

    if (completion.options.closeOnUnfocus) {
      var closingOnBlur;
      cm.on(
        'blur',
        (this.onBlur = function () {
          closingOnBlur = setTimeout(function () {
            completion.close();
          }, 100);
        })
      );
      cm.on(
        'focus',
        (this.onFocus = function () {
          clearTimeout(closingOnBlur);
        })
      );
    }

    cm.on(
      'scroll',
      (this.onScroll = function () {
        var curScroll = cm.getScrollInfo(),
          editor = cm.getWrapperElement().getBoundingClientRect();
        if (!startScroll) startScroll = cm.getScrollInfo();
        var newTop = top + startScroll.top - curScroll.top;
        var point =
          newTop -
          (parentWindow.pageYOffset ||
            (ownerDocument.documentElement || ownerDocument.body).scrollTop);
        if (!below) point += hints.offsetHeight;
        if (point <= editor.top || point >= editor.bottom)
          return completion.close();
        hints.style.top = newTop + 'px';
        hints.style.left = left + startScroll.left - curScroll.left + 'px';
      })
    );

    function getHintElement(container, el) {
      while (el && el !== container && el.hintId == null) {
        el = el.parentNode;
      }
      return el;
    }

    CodeMirror.on(hints, 'dblclick', function (e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        widget.pick();
      }
    });

    CodeMirror.on(hints, 'click', function (e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        if (completion.options.completeOnSingleClick) widget.pick();
      }
    });

    CodeMirror.on(hints, 'mousedown', function () {
      setTimeout(function () {
        cm.focus();
      }, 20);
    });

    // The first hint doesn't need to be scrolled to on init
    var selectedHintRange = this.getSelectedHintRange();
    if (selectedHintRange.from !== 0 || selectedHintRange.to !== 0) {
      this.scrollToActive();
    }

    CodeMirror.signal(
      data,
      'select',
      completions[this.selectedHint],
      hints.childNodes[this.selectedHint]
    );
    return true;
  }

  Widget.prototype = {
    close: function () {
      if (this.completion.widget != this) return;
      this.completion.widget = null;
      if (this.hints.parentNode) this.hints.parentNode.removeChild(this.hints);
      this.completion.cm.removeKeyMap(this.keyMap);
      var input = this.completion.cm.getInputField();
      input.removeAttribute('aria-activedescendant');
      input.removeAttribute('aria-owns');

      var cm = this.completion.cm;
      if (this.completion.options.closeOnUnfocus) {
        cm.off('blur', this.onBlur);
        cm.off('focus', this.onFocus);
      }
      cm.off('scroll', this.onScroll);

      removeInlineHint(cm);
    },

    disable: function () {
      this.completion.cm.removeKeyMap(this.keyMap);
      var widget = this;
      this.keyMap = {
        Enter: function () {
          widget.picked = true;
        }
      };
      this.completion.cm.addKeyMap(this.keyMap);
    },

    pick: function () {
      this.completion.pick(this.data, this.selectedHint);
    },

    changeActive: function (i, avoidWrap) {
      if (i >= this.data.list.length)
        i = avoidWrap ? this.data.list.length - 1 : 0;
      else if (i < 0) i = avoidWrap ? 0 : this.data.list.length - 1;

      if (this.selectedHint == i) {
        changeInlineHint(this.completion.cm, this.data.list[this.selectedHint]);
        return this.data.list[this.selectedHint];
      }

      var node = this.hints.childNodes[this.selectedHint];
      if (node) {
        node.className = node.className.replace(
          ' ' + ACTIVE_HINT_ELEMENT_CLASS,
          ''
        );
        node.removeAttribute('aria-selected');
      }
      node = this.hints.childNodes[(this.selectedHint = i)];
      node.className += ' ' + ACTIVE_HINT_ELEMENT_CLASS;
      node.setAttribute('aria-selected', 'true');
      this.completion.cm
        .getInputField()
        .setAttribute('aria-activedescendant', node.id);
      this.scrollToActive();
      CodeMirror.signal(
        this.data,
        'select',
        this.data.list[this.selectedHint],
        node
      );

      changeInlineHint(this.completion.cm, this.data.list[this.selectedHint]);
      return this.data.list[this.selectedHint];
    },

    scrollToActive: function () {
      var selectedHintRange = this.getSelectedHintRange();
      var node1 = this.hints.childNodes[selectedHintRange.from];
      var node2 = this.hints.childNodes[selectedHintRange.to];
      var firstNode = this.hints.firstChild;
      if (node1.offsetTop < this.hints.scrollTop)
        this.hints.scrollTop = node1.offsetTop - firstNode.offsetTop;
      else if (
        node2.offsetTop + node2.offsetHeight >
        this.hints.scrollTop + this.hints.clientHeight
      )
        this.hints.scrollTop =
          node2.offsetTop +
          node2.offsetHeight -
          this.hints.clientHeight +
          firstNode.offsetTop;
    },

    screenAmount: function () {
      return (
        Math.floor(
          this.hints.clientHeight / this.hints.firstChild.offsetHeight
        ) || 1
      );
    },

    getSelectedHintRange: function () {
      var margin = this.completion.options.scrollMargin || 0;
      return {
        from: Math.max(0, this.selectedHint - margin),
        to: Math.min(this.data.list.length - 1, this.selectedHint + margin)
      };
    }
  };

  function applicableHelpers(cm, helpers) {
    if (!cm.somethingSelected()) return helpers;
    var result = [];
    for (var i = 0; i < helpers.length; i++)
      if (helpers[i].supportsSelection) result.push(helpers[i]);
    return result;
  }

  function fetchHints(hint, cm, options, callback) {
    if (hint.async) {
      hint(cm, callback, options);
    } else {
      var result = hint(cm, options);
      if (result && result.then) result.then(callback);
      else callback(result);
    }
  }

  function resolveAutoHints(cm, pos) {
    var helpers = cm.getHelpers(pos, 'hint'),
      words;
    if (helpers.length) {
      var resolved = function (cm, callback, options) {
        var app = applicableHelpers(cm, helpers);
        function run(i) {
          if (i == app.length) return callback(null);
          fetchHints(app[i], cm, options, function (result) {
            if (result && result.list.length > 0) callback(result);
            else run(i + 1);
          });
        }
        run(0);
      };
      resolved.async = true;
      resolved.supportsSelection = true;
      return resolved;
    } else if ((words = cm.getHelper(cm.getCursor(), 'hintWords'))) {
      return function (cm) {
        return CodeMirror.hint.fromList(cm, { words: words });
      };
    } else if (CodeMirror.hint.anyword) {
      return function (cm, options) {
        return CodeMirror.hint.anyword(cm, options);
      };
    } else {
      return function () {};
    }
  }

  CodeMirror.registerHelper('hint', 'auto', {
    resolve: resolveAutoHints
  });

  CodeMirror.registerHelper('hint', 'fromList', function (cm, options) {
    var cur = cm.getCursor(),
      token = cm.getTokenAt(cur);
    var term,
      from = CodeMirror.Pos(cur.line, token.start),
      to = cur;
    if (
      token.start < cur.ch &&
      /\w/.test(token.string.charAt(cur.ch - token.start - 1))
    ) {
      term = token.string.substr(0, cur.ch - token.start);
    } else {
      term = '';
      from = cur;
    }
    var found = [];
    for (var i = 0; i < options.words.length; i++) {
      var word = options.words[i];
      if (word.slice(0, term.length) == term) found.push(word);
    }

    if (found.length) return { list: found, from: from, to: to };
  });

  CodeMirror.commands.autocomplete = CodeMirror.showHint;

  var defaultOptions = {
    hint: CodeMirror.hint.auto,
    completeSingle: true,
    alignWithWord: true,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnPick: true,
    closeOnUnfocus: true,
    updateOnCursorActivity: true,
    completeOnSingleClick: true,
    container: null,
    customKeys: null,
    extraKeys: null,
    paddingForScrollbar: true,
    moveOnOverlap: true
  };

  CodeMirror.defineOption('hintOptions', null);
});
