import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { prop, remSize } from '../../../theme';
import { metaKeyName, metaKey } from '../../../utils/metaKey';

const Container = styled.div`
  margin-right: ${remSize(20)};
  padding: ${remSize(20)};
  padding-top: ${remSize(10)};
  padding-bottom: ${remSize(40)};
  width: ${remSize(450)};
  overflow-y: auto;
`;

const Command = styled.span`
  font-weight: bold;
  margin-right: ${remSize(10)};
  padding: ${remSize(3)};
  border: 1px solid ${prop('Button.primary.default.border')};
  border-radius: 3px;
`;

const ShortcutsList = styled.ul`
  &:not(:last-of-type) {
    padding-bottom: ${remSize(10)};
    border-bottom: 1px dashed ${prop('Button.primary.default.border')};
  }
`;

const Item = styled.li`
  display: flex;
  align-items: baseline;
  margin-top: ${remSize(10)};
`;

const SectionTitle = styled.h3`
  margin: ${remSize(10)} 0;
`;

const Shortcut = ({ children, keys, meta, shift, alt }) => {
  let command = '';
  if (meta) command += `${metaKeyName} + `;
  if (alt) command += '⌥ +';
  if (shift) command += '\u21E7 + ';
  command += keys;

  return (
    <Item>
      <Command>{command}</Command>
      <span>{children}</span>
    </Item>
  );
};

Shortcut.propTypes = {
  children: PropTypes.string.isRequired,
  keys: PropTypes.string.isRequired,
  meta: PropTypes.bool,
  shift: PropTypes.bool,
  alt: PropTypes.bool
};

Shortcut.defaultProps = {
  meta: false,
  shift: false,
  alt: false
};

function KeyboardShortcutModal() {
  const { t } = useTranslation();
  return (
    <Container>
      <SectionTitle>
        {t('KeyboardShortcuts.CodeEditing.CodeEditing')}
      </SectionTitle>
      <p>
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
      <ShortcutsList>
        <Shortcut keys="F" meta shift>
          {t('KeyboardShortcuts.CodeEditing.Tidy')}
        </Shortcut>
        <Shortcut keys="F" meta>
          {t('KeyboardShortcuts.CodeEditing.FindText')}
        </Shortcut>
        <Shortcut keys="G" meta>
          {t('KeyboardShortcuts.CodeEditing.FindNextTextMatch')}
        </Shortcut>
        <Shortcut keys="G" meta shift>
          {t('KeyboardShortcuts.CodeEditing.FindPreviousTextMatch')}
        </Shortcut>
        <Shortcut
          {...(metaKey === 'Ctrl'
            ? { keys: 'H', meta: true }
            : { keys: 'F', meta: true, alt: true })}
        >
          {t('KeyboardShortcuts.CodeEditing.ReplaceTextMatch')}
        </Shortcut>
        <Shortcut keys="[" meta>
          {t('KeyboardShortcuts.CodeEditing.IndentCodeLeft')}
        </Shortcut>
        <Shortcut keys="]" meta>
          {t('KeyboardShortcuts.CodeEditing.IndentCodeRight')}
        </Shortcut>
        <Shortcut keys="/" meta>
          {t('KeyboardShortcuts.CodeEditing.CommentLine')}
        </Shortcut>
        <Shortcut keys="." meta>
          {t('KeyboardShortcuts.CodeEditing.CommentLine')}
        </Shortcut>
        <Shortcut keys="K" meta>
          {t('KeyboardShortcuts.CodeEditing.ColorPicker')}
        </Shortcut>
      </ShortcutsList>
      <SectionTitle>{t('KeyboardShortcuts.General.General')}</SectionTitle>
      <ShortcutsList>
        <Shortcut keys="S" meta>
          {t('Common.Save')}
        </Shortcut>
        <Shortcut keys="Enter" meta>
          {t('KeyboardShortcuts.General.StartSketch')}
        </Shortcut>
        <Shortcut keys="Enter" meta shift>
          {t('KeyboardShortcuts.General.StopSketch')}
        </Shortcut>
        <Shortcut keys="1" meta shift>
          {t('KeyboardShortcuts.General.TurnOnAccessibleOutput')}
        </Shortcut>
        <Shortcut keys="2" meta shift>
          {t('KeyboardShortcuts.General.TurnOffAccessibleOutput')}
        </Shortcut>
        <Shortcut keys="Right" shift>
          {t('KeyboardShortcuts.General.GoToReference')}
        </Shortcut>
      </ShortcutsList>
    </Container>
  );
}

export default KeyboardShortcutModal;
