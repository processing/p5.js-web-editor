import styled from 'styled-components';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const StyledRoot = styled.article`
  font-size: ${(props) => props.fontSize}px;
`;

StyledRoot.propTypes = {
  fontSize: PropTypes.number.isRequired,
  lineWrap: PropTypes.bool.isRequired,
  lineNumbers: PropTypes.bool.isRequired
};

const ElementWithClasses = forwardRef((props, ref) => {
  const theme = useSelector((state) => state.preferences.theme);
  const lineNumbers = useSelector((state) => state.preferences.lineNumbers);
  const lineWrap = useSelector((state) => state.preferences.linewrap);
  const fontSize = useSelector((state) => state.preferences.fontSize);

  return (
    <StyledRoot
      className={classNames(`cm-s-p5-${theme}`, props.className)}
      fontSize={fontSize}
      lineWrap={lineWrap}
      lineNumbers={lineNumbers}
      {...props}
      ref={ref}
    />
  );
});

ElementWithClasses.propTypes = {
  className: PropTypes.string,
  children: PropTypes.element
};

ElementWithClasses.defaultProps = {
  className: '',
  children: null
};

export default ElementWithClasses;
