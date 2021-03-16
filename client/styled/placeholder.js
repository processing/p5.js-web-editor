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

export const iconToast = css``;
