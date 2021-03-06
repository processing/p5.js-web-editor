import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { remSize, prop } from '../../../theme';
import { metaKeyName, metaKey } from '../../../utils/metaKey';

const KeyboardShortcutsWrapper = styled.div`
  padding: ${remSize(20)};
  margin-right: ${remSize(20)};
  padding-bottom: ${remSize(40)};
  width: ${remSize(450)};
  overflow-y: scroll;
`;
const KeyboardShortcutsTitle = styled.h3`
  padding-bottom: ${remSize(10)};
  :not(:first-of-type) {
    border-top: 1px dashed ${prop('Button.default.border')};
    padding-top: ${remSize(10)};
  }
`;
const KeyboardShortcutsDescription = styled.p`
  padding-bottom: ${remSize(10)};
`;
const KeyboardShortcutsList = styled.ul`
  :not(:last-of-type) {
    padding-bottom: ${remSize(10)};
  }
`;
const KeyboardShortcutsItem = styled.li`
  display: flex;
  align-items: baseline;
  & + & {
    margin-top: ${remSize(10)};
  }
`;
const KeyboardShortcutsCommand = styled.span`
  font-weight: bold;
  text-align: right;
  margin-right: ${remSize(10)};
  padding: ${remSize(3)};
  border: 1px solid ${prop('Button.default.border')};
  border-radius: 3px;
`;

function KeyboardShortcutModal() {
  const { t } = useTranslation();
  const replaceCommand =
    metaKey === 'Ctrl' ? `${metaKeyName} + H` : `${metaKeyName} + ⌥ + F`;
  return (
    <KeyboardShortcutsWrapper>
      <KeyboardShortcutsTitle>
        {t('KeyboardShortcuts.CodeEditing.CodeEditing')}
      </KeyboardShortcutsTitle>
      <KeyboardShortcutsDescription>
        {t('KeyboardShortcuts.ShortcutsFollow')}{' '}
        <a
          href="https://shortcuts.design/toolspage-sublimetext.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('KeyboardShortcuts.SublimeText')}
        </a>
        .
      </KeyboardShortcutsDescription>
      <KeyboardShortcutsList>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + {'\u21E7'} + F
          </KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.Tidy')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + F</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.FindText')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + G</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.FindNextTextMatch')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + {'\u21E7'} + G
          </KeyboardShortcutsCommand>
          <span>
            {t('KeyboardShortcuts.CodeEditing.FindPreviousTextMatch')}
          </span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{replaceCommand}</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.ReplaceTextMatch')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + [</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.IndentCodeLeft')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + ]</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.IndentCodeRight')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + /</KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.CodeEditing.CommentLine')}</span>
        </KeyboardShortcutsItem>
      </KeyboardShortcutsList>
      <KeyboardShortcutsTitle>General</KeyboardShortcutsTitle>
      <KeyboardShortcutsList>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>{metaKeyName} + S</KeyboardShortcutsCommand>
          <span>{t('Common.Save')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + Enter
          </KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.General.StartSketch')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + {'\u21E7'} + Enter
          </KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.General.StopSketch')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + {'\u21E7'} + 1
          </KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.General.TurnOnAccessibleOutput')}</span>
        </KeyboardShortcutsItem>
        <KeyboardShortcutsItem>
          <KeyboardShortcutsCommand>
            {metaKeyName} + {'\u21E7'} + 2
          </KeyboardShortcutsCommand>
          <span>{t('KeyboardShortcuts.General.TurnOffAccessibleOutput')}</span>
        </KeyboardShortcutsItem>
      </KeyboardShortcutsList>
    </KeyboardShortcutsWrapper>
  );
}

export default KeyboardShortcutModal;
