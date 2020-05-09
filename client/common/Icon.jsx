import PropTypes from 'prop-types';

import SortArrowUp from '../images/sort-arrow-up.svg';
import SortArrowDown from '../images/sort-arrow-down.svg';
import Github from '../images/github.svg';
import Google from '../images/google.svg';
import Plus from '../images/plus-icon.svg';
import Close from '../images/close.svg';

// https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html
// could do something like, if there's an aria-label prop, give it role="img" focusable="false"
// otherwise, give it aria-hidden="true" focusable="false"

const Icons = {
  SortArrowUp,
  SortArrowDown,
  Github,
  Google,
  Plus,
  Close
};

export default Icons;

export const ValidIconNameType = PropTypes.oneOf(Object.keys(Icons));
