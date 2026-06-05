import {
  completionStatus,
  selectedCompletionIndex,
  closeBracketsKeymap
} from '@codemirror/autocomplete';
import {
  insertTab,
  indentLess,
  defaultKeymap,
  historyKeymap
} from '@codemirror/commands';
import { foldKeymap } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
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
  { key: 'ArrowRight', run: focusOnReferenceArrow },
  { key: 'Tab', run: insertTab, shift: indentLess }
];

export const emmetKeymaps = [{ key: 'Tab', run: expandAbbreviation }];

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

export function buildKeymaps(mode) {
  const colorPickerKeymap = createColorPickerKeymap(mode);
  const fileTidyKeymap = createFileTidyKeymap(mode);

  return [
    extraKeymaps,
    colorPickerKeymap,
    fileTidyKeymap,
    closeBracketsKeymap,
    defaultKeymap,
    historyKeymap,
    foldKeymap,
    searchKeymap
  ];
}
