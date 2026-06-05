/**
 * This file contains utility functions for creating custom styled
 * elements for our CodeMirror extensions. */

/**
 * Returns completion options configured for autocomplete.
 * This gets passed into the autocomplete extension in
 * stateUtils when creating a new file state.
 */
export const createAutocompleteOptions = (referenceBaseUrl) => ({
  selectOnOpen: false,
  tooltipClass: () => 'CodeMirror-hints',
  closeOnBlur: false,
  icons: false,

  // handle css classes
  optionClass(completion) {
    let className = 'CodeMirror-hint';

    if (completion.type) {
      className += ` hint-type-${completion.type}`;
    }

    if (completion.p5DocPath) {
      className += ' has-doc-link';
    }

    return className;
  },

  addToOptions: [
    {
      position: 60,
      render(completion) {
        const kind = document.createElement('span');
        kind.className = 'cm-completionKind';
        kind.textContent = completion.kindLabel || completion.type || '';
        return kind;
      }
    },
    {
      position: 80,
      render(completion, state, view) {
        if (!completion.p5DocPath) return null;

        const link = document.createElement('a');
        link.className = 'cm-completionRefLink';
        link.href = `${referenceBaseUrl}/reference/p5/${completion.p5DocPath}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.tabIndex = -1;
        link.setAttribute('aria-label', `Open ${completion.label} reference`);

        link.innerHTML = `
          <span class="hint-hidden">open ${completion.label} reference</span>
          <span aria-hidden="true">&#10132;</span>
        `;

        link.addEventListener('mousedown', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });

        link.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        link.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowLeft' || event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            link.classList.remove('focused-hint-link');
            view.focus();
          }
        });

        return link;
      }
    },
    {
      position: 100,
      render(completion) {
        if (!completion.blacklisted) return null;

        const warning = document.createElement('div');
        warning.className = 'cm-completionWarning';

        const icon = document.createElement('span');
        icon.className = 'cm-completionWarningIcon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '⚠️';

        const text = document.createElement('span');
        text.className = 'cm-completionWarningText';
        text.textContent = 'use with caution in this context';

        warning.appendChild(icon);
        warning.appendChild(text);

        return warning;
      }
    }
  ]
});

/** Used in the fold gutter extension. */
export function createFoldMarker(open) {
  // Uses window.document explicitly to avoid shadowing by the `document`
  // parameter in createNewFileState below.
  const span = window.document.createElement('span');
  span.className = open ? 'cm-fold-open' : 'cm-fold-closed';
  return span;
}
