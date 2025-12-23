import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SortArrowUp from '../images/sort-arrow-up.svg';
import SortArrowDown from '../images/sort-arrow-down.svg';
import Github from '../images/github.svg';
import Google from '../images/google.svg';
import Plus from '../images/plus-icon.svg';
import Close from '../images/close.svg';
import Exit from '../images/exit.svg';
import DropdownArrow from '../images/down-filled-triangle.svg';
import Preferences from '../images/preferences.svg';
import Play from '../images/triangle-arrow-right.svg';
import More from '../images/more.svg';
import Editor from '../images/editor.svg';
import Account from '../images/account.svg';
import Code from '../images/code.svg';
import Save from '../images/save.svg';
import Terminal from '../images/terminal.svg';
import Folder from '../images/folder-padded.svg';
import CircleTerminal from '../images/circle-terminal.svg';
import CircleFolder from '../images/circle-folder.svg';
import CircleInfo from '../images/circle-info.svg';
import Add from '../images/add.svg';
import Filter from '../images/filter.svg';
import Cross from '../images/cross.svg';
import Copy from '../images/copy.svg';

export interface IconColors {
  default?: string;
  hover?: string;
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  'aria-label'?: string;
  Icon?: IconColors;
}

// HOC that adds the right web accessibility props
// https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html

// could also give these a default size, color, etc. based on the theme
// Need to add size to these - like small icon, medium icon, large icon. etc.
function withLabel(
  SvgComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>
) {
  const StyledIcon = styled(SvgComponent)<IconProps>`
    &&& {
      color: ${(props) => props.Icon?.default};
      & g,
      & path,
      & polygon {
        opacity: 1;
        fill: ${(props) => props.Icon?.default};
      }
      &:hover {
        color: ${(props) => props.Icon?.hover};
        & g,
        & path,
        & polygon {
          opacity: 1;
          fill: ${(props) => props.Icon?.hover};
        }
      }
    }
  `;

  // Necessary because styled components inject a different type for the ref prop
  type StyledIconProps = Omit<
    React.ComponentProps<typeof StyledIcon>,
    'ref'
  > & {
    ref?: React.Ref<SVGSVGElement>;
  };

  const Icon = (props: StyledIconProps) => {
    const { 'aria-label': ariaLabel, ...rest } = props;
    if (ariaLabel) {
      return (
        <StyledIcon
          {...rest}
          aria-label={ariaLabel}
          role="img"
          focusable="false"
        />
      );
    }
    return <StyledIcon {...rest} aria-hidden focusable="false" />;
  };

  return Icon;
}

export const SortArrowUpIcon = withLabel(SortArrowUp);
export const SortArrowDownIcon = withLabel(SortArrowDown);
export const GithubIcon = withLabel(Github);
export const GoogleIcon = withLabel(Google);
export const PlusIcon = withLabel(Plus);
export const CloseIcon = withLabel(Close);
export const ExitIcon = withLabel(Exit);
export const EditorIcon = withLabel(Editor);
export const AccountIcon = withLabel(Account);
export const DropdownArrowIcon = withLabel(DropdownArrow);
export const PreferencesIcon = withLabel(Preferences);
export const PlayIcon = withLabel(Play);
export const MoreIcon = withLabel(More);
export const TerminalIcon = withLabel(Terminal);
export const CodeIcon = withLabel(Code);
export const SaveIcon = withLabel(Save);
export const FolderIcon = withLabel(Folder);
export const CrossIcon = withLabel(Cross);
export const CircleTerminalIcon = withLabel(CircleTerminal);
export const CircleFolderIcon = withLabel(CircleFolder);
export const CircleInfoIcon = withLabel(CircleInfo);
export const AddIcon = withLabel(Add);
export const FilterIcon = withLabel(Filter);
export const CopyIcon = withLabel(Copy);
