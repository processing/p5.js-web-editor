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

export const preferenceOption = css`
  background-color: transparent;
  color: ${({ theme }) => theme.inactiveTextColor};
  &:hover {
    color: ${({ theme }) => theme.heavyTextColor};
  }
  font-size: ${remSize(12)};
  cursor: pointer;
  text-align: left;
  padding: 0;
  margin-bottom: ${remSize(5)};
  padding-right: ${remSize(5)};
  border: 0;
  list-style-type: none;
`;

export const modal = css`
  background-color: ${({ theme }) => theme.Modal.background};
  border: ${({ theme }) => `1px solid ${theme.Modal.border}`};
  box-shadow: ${({ theme }) => `0 12px 12px ${theme.common.shadowColor}`};
  border-radius: 2px;
  z-index: 20;
`;

export const hiddenElement = css`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const link = css`
  text-decoration: none;
  color: ${({ theme }) => theme.inactiveTextColor};
  cursor: pointer;
  & g,
  & path {
    fill: ${({ theme }) => theme.inactiveTextColor};
  }
  &:hover {
    text-decoration: none;
    color: ${({ theme }) => theme.heavyTextColor};
    & g,
    & path {
      fill: ${({ theme }) => theme.heavyTextColor};
    }
  }
`;

export const dropdownOpen = css`
  background-color: ${({ theme }) => theme.Modal.background};
  border: ${({ theme }) => `1px solid ${theme.Modal.border}`};
  box-shadow: ${({ theme }) => `0 0 18px 0 ${theme.common.shadowColor}`};
  color: ${({ theme }) => theme.primaryTextColor};
  text-align: left;
  width: ${remSize(180)};
  display: flex;
  position: absolute;
  flex-direction: column;
  top: 95%;
  height: auto;
  z-index: 9999;
  border-radius: ${remSize(6)};
  & li:first-child {
    border-radius: ${remSize(5)} ${remSize(5)} 0 0;
  }
  & li:last-child {
    border-radius: 0 0 ${remSize(5)} ${remSize(5)};
  }
  & li {
    & button,
    & a {
      color: ${({ theme }) => theme.primaryTextColor};
      width: 100%;
      text-align: left;
      padding: ${remSize(8)} ${remSize(16)};
    }
    height: ${remSize(35)};
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  & li:hover {
    background-color: ${({ theme }) => theme.Button.hover.background};
    color: ${({ theme }) => theme.Button.hover.foreground};
    & button,
    & a {
      color: ${({ theme }) => theme.Button.hover.foreground};
    }
  }
`;

export const dropdownOpenLeft = css`
  ${dropdownOpen};
  left: 0;
`;

export const dropdownOpenRight = css`
  ${dropdownOpen};
  right: 0;
`;
