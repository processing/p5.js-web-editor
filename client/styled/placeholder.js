import { css } from 'styled-components';
import { remSize } from '../theme';

export const toolbarButton = css`
  display: inline-block;
  height: ${remSize(44)};
  width: ${remSize(44)};
  text-align: center;
  border-radius: 100%;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: ${({ theme }) => theme.toolbarButton.backgroundColor};
  color: ${({ theme }) => theme.toolbarButton.color};
  & g,
  & path {
    fill: ${({ theme }) => theme.toolbarButton.color};
  }
  &:hover {
    background-color: ${({ theme }) => theme.Button.hover.background};
    color: ${({ theme }) => theme.Button.hover.foreground};

    & g,
    & path {
      fill: ${({ theme }) => theme.Button.hover.foreground};
    }
  }
  &--selected {
    background-color: ${({ theme }) => theme.Button.hover.background};
    & g,
    & path {
      fill: ${({ theme }) => theme.Button.hover.foreground};
    }
  }
`;

export const iconToast = css`
  color: ${({ theme }) => theme.toast.textColor};
  & g,
  & path {
    fill: ${({ theme }) => theme.toast.textColor};
  }
  &:hover {
    color: ${({ theme }) => theme.iconToastHoverColor};
    & g,
    & path {
      opacity: 1;
      fill: ${({ theme }) => theme.iconToastHoverColor};
    }
  }
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

export const noneThemifyIcon = css`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

export const noneThemifyIconWithHover = css`
  color: ${({ theme }) => theme.grays.mediumDark};
  & g,
  & path {
    fill: ${({ theme }) => theme.grays.mediumDark};
  }
  &:hover {
    color: ${({ theme }) => theme.colors.p5jsPink};
    & g,
    & path {
      opacity: 1;
      fill: ${({ theme }) => theme.colors.p5jsPink};
    }
  }
  ${noneThemifyIcon}
`;

export const button = css`
  background-color: ${({ theme }) => theme.Button.default.background};
  color: ${({ theme }) => theme.Button.default.foreground};
  cursor: pointer;
  border: ${({ theme }) => `2px solid ${theme.Button.default.border}`};
  border-radius: 2px;
  padding: ${remSize(10)} ${remSize(30)};
  & g,
  & path {
    fill: ${({ theme }) => theme.Button.default.foreground};
    opacity: 1;
  }
  &:not(disabled):hover {
    border-color: ${({ theme }) => theme.Button.hover.border};
    background-color: ${({ theme }) => theme.Button.hover.background};
    color: ${({ theme }) => theme.Button.hover.foreground};
    & g,
    & path {
      fill: ${({ theme }) => theme.Button.hover.foreground};
    }
  }
  &:not(disabled):active {
    border-color: ${({ theme }) => theme.Button.active.border};
    background-color: ${({ theme }) => theme.Button.active.background};
    color: ${({ theme }) => theme.Button.active.foreground};
    & g,
    & path {
      fill: ${({ theme }) => theme.Button.active.foreground};
    }
  }
`;

export const preferencesButton = css`
  ${toolbarButton};
  color: ${({ theme }) => theme.primaryTextColor};
  background-color: ${({ theme }) => theme.preferencesButtonBackgroundColor};
  padding: 0;
  margin-bottom: ${remSize(28)};
  line-height: ${remSize(50)};
  & g,
  & path {
    fill: ${({ theme }) => theme.Modal.button};
  }
  &:enabled:hover {
    background-color: ${({ theme }) => theme.Button.hover.background};
    color: ${({ theme }) => theme.Button.hover.foreground};
    & g,
    & path {
      fill: ${({ theme }) => theme.Button.hover.foreground};
    }
  }
  &:disabled:hover {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.preferencesButtonBackgroundColor};
  }
`;
