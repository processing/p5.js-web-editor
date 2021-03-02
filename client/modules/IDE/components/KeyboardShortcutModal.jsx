import React from 'react';
import { useTranslation } from 'react-i18next';
import { metaKeyName, metaKey } from '../../../utils/metaKey';

function KeyboardShortcutModal() {
  const { t } = useTranslation();
  const replaceCommand =
    metaKey === 'Ctrl' ? `${metaKeyName} + H` : `${metaKeyName} + ⌥ + F`;
  return (
    <div className="keyboard-shortcuts">
      <h3 className="keyboard-shortcuts__title">
        {t('KeyboardShortcuts.CodeEditing.CodeEditing')}
      </h3>
      <p className="keyboard-shortcuts__description">
        {t('KeyboardShortcuts.ShortcutsFollow')}{' '}
        <a
          href="https://shortcuts.design/toolspage-sublimetext.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('KeyboardShortcuts.SublimeText')}
        </a>
        .
      </p>
      <ul className="keyboard-shortcuts__list">
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + F
          </span>
          <span>{t('KeyboardShortcuts.CodeEditing.Tidy')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + F</span>
          <span>{t('KeyboardShortcuts.CodeEditing.FindText')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + G</span>
          <span>{t('KeyboardShortcuts.CodeEditing.FindNextTextMatch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + G
          </span>
          <span>
            {t('KeyboardShortcuts.CodeEditing.FindPreviousTextMatch')}
          </span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{replaceCommand}</span>
          <span>{t('KeyboardShortcuts.CodeEditing.ReplaceTextMatch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + [</span>
          <span>{t('KeyboardShortcuts.CodeEditing.IndentCodeLeft')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + ]</span>
          <span>{t('KeyboardShortcuts.CodeEditing.IndentCodeRight')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + /</span>
          <span>{t('KeyboardShortcuts.CodeEditing.CommentLine')}</span>
        </li>
      </ul>
      <h3 className="keyboard-shortcuts__title">General</h3>
      <ul className="keyboard-shortcuts__list">
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + S</span>
          <span>{t('Common.Save')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + Enter
          </span>
          <span>{t('KeyboardShortcuts.General.StartSketch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + Enter
          </span>
          <span>{t('KeyboardShortcuts.General.StopSketch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + 1
          </span>
          <span>{t('KeyboardShortcuts.General.TurnOnAccessibleOutput')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + 2
          </span>
          <span>{t('KeyboardShortcuts.General.TurnOffAccessibleOutput')}</span>
        </li>
      </ul>
    </div>
  );
}

export default KeyboardShortcutModal;
