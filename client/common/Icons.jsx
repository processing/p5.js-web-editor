import React from 'react';
import PropTypes from 'prop-types';
import SortArrowUp from '../images/sort-arrow-up.svg';
import SortArrowDown from '../images/sort-arrow-down.svg';
import Github from '../images/github.svg';
import Google from '../images/google.svg';
import Plus from '../images/plus-icon.svg';
import Close from '../images/close.svg';
import DropdownArrow from '../images/down-filled-triangle.svg';
import Play from '../images/triangle-arrow-right.svg';
import Preferences from '../images/preferences.svg';


// HOC that adds the right web accessibility props
// https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html

// could also give these a default size, color, etc. based on the theme
// Need to add size to these - like small icon, medium icon, large icon. etc.
function withLabel(SvgComponent) {
  const Icon = (props) => {
    const { 'aria-label': ariaLabel } = props;
    if (ariaLabel) {
      return (<SvgComponent
        {...props}
        aria-label={ariaLabel}
        role="img"
        focusable="false"
      />);
    }
    return (<SvgComponent
      {...props}
      aria-hidden
      focusable="false"
    />);
  };

  Icon.propTypes = {
    'aria-label': PropTypes.string
  };

  Icon.defaultProps = {
    'aria-label': null
  };

  return Icon;
}

export const SortArrowUpIcon = withLabel(SortArrowUp);
export const SortArrowDownIcon = withLabel(SortArrowDown);
export const GithubIcon = withLabel(Github);
export const GoogleIcon = withLabel(Google);
export const PlusIcon = withLabel(Plus);
export const CloseIcon = withLabel(Close);
export const DropdownArrowIcon = withLabel(DropdownArrow);
export const PlayIcon = withLabel(Play);
export const PreferencesIcon = withLabel(Preferences);
