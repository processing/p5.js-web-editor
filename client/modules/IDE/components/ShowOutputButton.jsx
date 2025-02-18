import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { prop } from '../../../theme';

const Button = styled.button`
  width: 90%;
  margin: 10px auto;
  z-index: 4;
  padding: 1rem;
  border-radius: 100px;
  align-items: center;
  color: #ffffff !important;
  ${prop('Button.secondary.default')};
`;

const ShowOutputButton = ({ showOutput, setShowOutput }) => (
  <Button onClick={() => setShowOutput((prev) => !prev)}>
    {showOutput ? 'Show Code' : 'Show Output'}
  </Button>
);

ShowOutputButton.propTypes = {
  showOutput: PropTypes.bool.isRequired,
  setShowOutput: PropTypes.func.isRequired
};

export default ShowOutputButton;
