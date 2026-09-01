import {
  completionStatus,
  selectedCompletionIndex,
  closeBracketsKeymap,
  completionKeymap,
  acceptCompletion
} from '@codemirror/autocomplete';
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
  moveLineUp,
  moveLineDown
} from '@codemirror/commands';
import { foldKeymap } from '@codemirror/language';
import {
  gotoLine,
  selectNextOccurrence,
  findNext,
  findPrevious,
  selectSelectionMatches,
  closeSearchPanel
} from '@codemirror/search';
import { expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { tidyCodeWithPrettier } from './tidier';

function getColorPickerAtSelection(view) {
  const { head } = view.state.selection.main;
  const { node } = view.domAtPos(head);

  const startEl =
    node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;

  const lineEl = startEl?.closest('.cm-line');

  return (
    lineEl?.querySelector('input[type="color"]:not(:disabled)') ||
    view.contentDOM.querySelector('input[type="color"]:not(:disabled)')
  );
}

export function focusOnReferenceArrow(view) {
  if (completionStatus(view.state) !== 'active') return false;

  const selectedIndex = selectedCompletionIndex(view.state);
  if (selectedIndex == null || selectedIndex < 0) return false;

  const tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
  if (!tooltip) return false;

  const options = tooltip.querySelectorAll('li.CodeMirror-hint');
  const selectedOption = options[selectedIndex];
  if (!selectedOption) return false;

  const link = selectedOption.querySelector('.cm-completionRefLink');
  if (!link) return false;

  link.focus();
  link.classList.add('focused-hint-link');

  const cleanup = () => {
    link.classList.remove('focused-hint-link');
    link.removeEventListener('blur', cleanup);
  };
  link.addEventListener('blur', cleanup);

  return true;
}

export function openColorPickerWithKeyboard(view) {
  const picker = getColorPickerAtSelection(view);

  if (!picker || picker.disabled) {
    return false;
  }

  picker.focus();

  if (typeof picker.showPicker === 'function') {
    picker.showPicker();
  } else {
    picker.click();
  }
  return true;
}

// Extra custom keymaps.
// TODO: We need to add sublime mappings + other missing extra mappings here.
export const extraKeymaps = [
  {
    key: 'Mod-Enter',
    run: () => true
  },
  { key: 'ArrowRight', run: focusOnReferenceArrow },
  indentWithTab,
  { key: 'Ctrl-Shift-ArrowUp', mac: 'Cmd-Ctrl-ArrowUp', run: moveLineUp },
  { key: 'Ctrl-Shift-ArrowDown', mac: 'Cmd-Ctrl-ArrowDown', run: moveLineDown }
];

export const emmetKeymaps = [{ key: 'Tab', run: expandAbbreviation }];

function createAutocompleteKeymap() {
  return [
    ...completionKeymap.filter((binding) => binding.key !== 'Ctrl-Space'),
    { key: 'Tab', run: acceptCompletion }
  ];
}

function createColorPickerKeymap(mode) {
  const colorPickerKeymap = [];
  if (mode === 'css' || mode === 'javascript') {
    colorPickerKeymap.push({
      key: 'Mod-k',
      run: (view) => openColorPickerWithKeyboard(view)
    });
  }
  return colorPickerKeymap;
}

function createFileTidyKeymap(mode) {
  // Make a keymap for both uppercase and lowercase F, since
  // browsers can differ in which one they send for the Shift-Mod-F shortcut.
  return [
    {
      key: 'Shift-Mod-F',
      run: (cmView) => {
        tidyCodeWithPrettier(cmView, mode);
        return true;
      }
    },
    {
      key: 'Shift-Mod-f',
      run: (cmView) => {
        tidyCodeWithPrettier(cmView, mode);
        return true;
      }
    }
  ];
}

function createSearchPanelKeymap(callback) {
  // Re-implements default search-related key bindings,
  // but with a custom callback for opening the search panel.
  return [
    {
      key: 'Mod-f',
      run: callback,
      preventDefault: true,
      stopPropagation: true
    },
    {
      key: 'F3',
      run: findNext,
      shift: findPrevious,
      scope: 'editor search-panel',
      preventDefault: true
    },
    {
      key: 'Mod-g',
      run: findNext,
      shift: findPrevious,
      scope: 'editor search-panel',
      preventDefault: true
    },
    { key: 'Mod-Shift-l', run: selectSelectionMatches },
    { key: 'Mod-Alt-g', run: gotoLine },
    { key: 'Mod-d', run: selectNextOccurrence, preventDefault: true },
    { key: 'Escape', run: closeSearchPanel, scope: 'editor search-panel' }
  ];
}

export function buildKeymaps(mode, searchPanelCallback) {
  const autocompleteKeymap = createAutocompleteKeymap();
  const colorPickerKeymap = createColorPickerKeymap(mode);
  const fileTidyKeymap = createFileTidyKeymap(mode);
  const searchPanelKeymap = createSearchPanelKeymap(searchPanelCallback);

  return [
    searchPanelKeymap,
    autocompleteKeymap,
    extraKeymaps,
    colorPickerKeymap,
    fileTidyKeymap,
    closeBracketsKeymap,
    defaultKeymap,
    historyKeymap,
    foldKeymap
  ];
}
