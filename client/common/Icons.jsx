import React from 'react';
import PropTypes from 'prop-types';
import SortArrowUp from '../images/sort-arrow-up.svg';
import SortArrowDown from '../images/sort-arrow-down.svg';
import Github from '../images/github.svg';
import Google from '../images/google.svg';
import Plus from '../images/plus-icon.svg';
import Close from '../images/close.svg';
import DropdownArrow from '../images/down-filled-triangle.svg';

// HOC that adds the right web accessibility props
// https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html

// could also give these a default size, color, etc. based on the theme
// Need to add size to these - like small icon, medium icon, large icon. etc.
function withLabel(Icon) {
  const render = (props) => {
    const { 'aria-label': ariaLabel } = props;
    if (ariaLabel) {
      return (<Icon
        {...props}
        aria-label={ariaLabel}
        role="img"
        focusable="false"
      />);
    }
    return (<Icon
      {...props}
      aria-hidden
      focusable="false"
    />);
  };

  render.propTypes = {
    'aria-label': PropTypes.string
  };

  render.defaultProps = {
    'aria-label': null
  };

  return render;
}

const Icons = {
  SortArrowUp: withLabel(SortArrowUp),
  SortArrowDown: withLabel(SortArrowDown),
  Github: withLabel(Github),
  Google: withLabel(Google),
  Plus: withLabel(Plus),
  Close: withLabel(Close),
  DropdownArrow: withLabel(DropdownArrow)
};

export default Icons;
