import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * CopyableTooltip: A reusable tooltip component with the ability
 * to copy text to the clipboard when triggered.
 */
const CopyableTooltip = ({ className, label, copyText, children }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(copyText);
    setIsCopied(true);
  };

  // Add click handler to element with the "copy-trigger" class
  const processChildren = (childElements) =>
    React.Children.map(childElements, (child) => {
      if (React.isValidElement(child)) {
        const childClassNames = child.props.className || '';

        if (childClassNames.includes('copy-trigger')) {
          return React.cloneElement(child, { onClick: handleCopyClick });
        }

        if (child.props.children) {
          const newChildren = processChildren(child.props.children);
          return React.cloneElement(child, { children: newChildren });
        }
      }

      return child;
    });

  const childrenWithClickHandler = processChildren(children);

  return (
    <div
      className={classNames(
        className,
        'tooltipped-no-delay',
        isCopied &&
          `tooltipped ${
            className.includes('tooltipped') ? className : 'tooltipped-n'
          }`
      )}
      aria-label={label}
      onMouseLeave={() => setIsCopied(false)}
    >
      {childrenWithClickHandler}
    </div>
  );
};

CopyableTooltip.propTypes = {
  className: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  copyText: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default CopyableTooltip;
