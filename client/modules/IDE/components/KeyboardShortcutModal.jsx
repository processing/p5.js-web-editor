import React from 'react';
import { useTranslation } from 'react-i18next';
import { metaKeyName, } from '../../../utils/metaKey';

function KeyboardShortcutModal() {
  const { t } = useTranslation();
  return (
    <div className="keyboard-shortcuts">
      <h3 className="keyboard-shortcuts__title">{t('CodeEditing')}</h3>
      <p className="keyboard-shortcuts__description">
        {t('Code editing keyboard shortcuts follow')} <a href="https://shortcuts.design/toolspage-sublimetext.html" target="_blank" rel="noopener noreferrer">{t('Sublime Text shortcuts')}</a>.
      </p>
      <ul className="keyboard-shortcuts__list">
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">{'\u21E7'} + Tab</span>
          <span>{t('Tidy')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + F
          </span>
          <span>{t('FindText')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + G
          </span>
          <span>{t('FindNextTextMatch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + G
          </span>
          <span>{t('FindPreviousTextMatch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + [
          </span>
          <span>{t('IndentCodeLeft')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + ]
          </span>
          <span>{t('IndentCodeRight')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + /
          </span>
          <span>{t('CommentLine')}</span>
        </li>
      </ul>
      <h3 className="keyboard-shortcuts__title">General</h3>
      <ul className="keyboard-shortcuts__list">
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + S
          </span>
          <span>{t('Save')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + Enter
          </span>
          <span>{t('StartSketch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + Enter
          </span>
          <span>{t('StopSketch')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + 1
          </span>
          <span>{t('TurnOnAccessibleOutput')}</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">
            {metaKeyName} + {'\u21E7'} + 2
          </span>
          <span>{t('TurnOffAccessibleOutput')}</span>
        </li>
      </ul>
    </div>
  );
}

export default KeyboardShortcutModal;
