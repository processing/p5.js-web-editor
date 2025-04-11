import React from 'react';
import { useTranslation } from 'react-i18next';
import { metaKeyName, metaKey } from '../../../utils/metaKey';
import KeyboardShortcutItem from './KeyboardShortcutItem';

function KeyboardShortcutModal() {
  const { t } = useTranslation();

  const replaceCommand =
    metaKey === 'Ctrl' ? `${metaKeyName} + H` : `${metaKeyName} + ⌥ + F`;
  const newFileCommand =
    metaKey === 'Ctrl' ? `${metaKeyName} + Alt + N` : `${metaKeyName} + ⌥ + N`;
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
        <KeyboardShortcutItem
          desc={t('KeyboardShortcuts.CodeEditing.Tidy')}
          keyName="tidy"
        />
        <KeyboardShortcutItem
          desc={t('KeyboardShortcuts.CodeEditing.FindText')}
          keyName="findPersistent"
        />
        <KeyboardShortcutItem
          desc={t('KeyboardShortcuts.CodeEditing.FindNextTextMatch')}
          keyName="findPersistentNext"
        />
        <KeyboardShortcutItem
          desc={t('KeyboardShortcuts.CodeEditing.FindPreviousTextMatch')}
          keyName="findPersistentPrev"
        />
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
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{metaKeyName} + .</span>
          <span>{t('KeyboardShortcuts.CodeEditing.CommentLine')}</span>
        </li>
        <KeyboardShortcutItem
          desc={t('KeyboardShortcuts.CodeEditing.ColorPicker')}
          keyName="colorPicker"
        />
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{newFileCommand}</span>
          <span>{t('KeyboardShortcuts.CodeEditing.CreateNewFile')}</span>
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
            {metaKeyName} + Shift + Enter
          </span>
          <span>{t('KeyboardShortcuts.General.StopSketch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + Shift + 1
          </span>
          <span>{t('KeyboardShortcuts.General.TurnOnAccessibleOutput')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + Shift + 2
          </span>
          <span>{t('KeyboardShortcuts.General.TurnOffAccessibleOutput')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">Shift + Right</span>
          <span>Go to Reference for Selected Item in Hinter</span>
        </li>
      </ul>
    </div>
  );
}

export default KeyboardShortcutModal;
