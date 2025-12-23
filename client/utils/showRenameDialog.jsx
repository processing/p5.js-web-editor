import announceToScreenReader from './ScreenReaderHelper';
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import { getContext, getAST } from './renameVariableHelper';

const allFuncs = require('./p5-reference-functions.json');

const allFunsList = new Set(allFuncs.functions.list);

function isValidIdentifierSelection(cm, fromPos, selection, tokenType) {
  const { scopeToDeclaredVarsMap = {}, userDefinedClassMetadata = {} } =
    p5CodeAstAnalyzer(cm) || {};
  const ast = getAST(cm);

  const baseContext = getContext(
    cm,
    ast,
    fromPos,
    scopeToDeclaredVarsMap,
    userDefinedClassMetadata
  );

  const isInsideClassContext = baseContext in userDefinedClassMetadata;

  if (tokenType === 'property' && !isInsideClassContext) return false;
  if (!selection || selection.trim() === '') return false;
  if (
    tokenType === 'comment' ||
    tokenType === 'atom' ||
    tokenType === 'string' ||
    tokenType === 'keyword'
  )
    return false;

  if (/\s/.test(selection)) return false;
  return /^[$A-Z_a-z][$\w]*$/.test(selection);
}

function addClickOutsideHandler(element, onOutsideClick) {
  let handler;

  function remove() {
    document.removeEventListener('mousedown', handler);
  }

  handler = (e) => {
    if (!element.contains(e.target)) {
      onOutsideClick();
      remove();
    }
  };

  document.addEventListener('mousedown', handler);
  return remove;
}

function addKeyHandler(keys, onKeyPress) {
  let handler;
  function remove() {
    document.removeEventListener('keydown', handler);
  }

  handler = (e) => {
    if (keys.includes(e.key)) {
      onKeyPress(e.key);
      remove();
    }
  };

  document.addEventListener('keydown', handler);
  return remove;
}

function showTemporaryDialog(coords, message) {
  const dialog = document.createElement('div');
  dialog.textContent = message;

  dialog.style.position = 'absolute';
  dialog.style.left = `${coords.left}px`;
  dialog.style.top = `${coords.bottom + 5}px`;
  dialog.style.zIndex = '10000';
  dialog.style.background = '#fff';
  dialog.style.border = '1px solid #ccc';
  dialog.style.padding = '5px 10px';
  dialog.style.borderRadius = '4px';
  dialog.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  dialog.style.fontSize = '14px';
  dialog.style.color = '#333';

  document.body.appendChild(dialog);

  let cleanup;

  const cleanupClick = addClickOutsideHandler(
    dialog,
    () => cleanup && cleanup()
  );
  const cleanupKeys = addKeyHandler(['Escape'], () => cleanup && cleanup());

  const timeout = setTimeout(cleanup, 2000);

  cleanup = () => {
    dialog.remove();
    clearTimeout(timeout);
    cleanupClick();
    cleanupKeys();
  };
}

function openRenameInputDialog(coords, oldName, onSubmit) {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', `Rename ${oldName}`);

  dialog.style.position = 'absolute';
  dialog.style.left = `${coords.left}px`;
  dialog.style.top = `${coords.bottom + 5}px`;
  dialog.style.zIndex = '10000';
  dialog.style.background = '#fff';
  dialog.style.border = '1px solid #ccc';
  dialog.style.padding = '5px 10px';
  dialog.style.borderRadius = '4px';
  dialog.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Enter new name');
  input.type = 'text';
  input.value = oldName;
  input.style.width = '200px';
  input.style.fontSize = '14px';

  dialog.appendChild(input);
  document.body.appendChild(dialog);
  input.focus();

  announceToScreenReader(`Renaming dialog box opened with word ${oldName}`);

  function cleanup() {
    dialog.remove();
  }

  const cleanupClick = addClickOutsideHandler(dialog, cleanup);
  const cleanupKeys = addKeyHandler(['Escape'], cleanup);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      if (value) {
        cleanup();
        cleanupClick();
        cleanupKeys();
        onSubmit(value);
        announceToScreenReader(
          `Renaming done from word ${oldName} to ${value}`
        );
      }
    }
  });
}

export default function showRenameDialog(
  cm,
  fromPos,
  tokenType,
  coords,
  oldName,
  onSubmit
) {
  if (
    (allFunsList.has(oldName) && tokenType !== 'p5-variable') ||
    !isValidIdentifierSelection(cm, fromPos, oldName, tokenType)
  ) {
    showTemporaryDialog(coords, 'You cannot rename this element');
    announceToScreenReader(`The word ${oldName} cannot be renamed`, true);
    return;
  }

  openRenameInputDialog(coords, oldName, onSubmit);
}
