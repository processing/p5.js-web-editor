import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { startSketch, stopSketch } from '../actions/ide';

const StyledMobileNavigation = styled.div`
  background-color: #f0f0f0;
  padding: 5px 10px;
`;

const Text = styled.div`
  color: #333;
  font-size: 12px;
`;

const MobileNavigation = ({ title }) => {
  const dispatch = useDispatch();
  const isPlaying = useSelector((state) => state.ide.isPlaying);

  const handleClick = () => {
    dispatch(isPlaying ? stopSketch() : startSketch());
  };

  return (
    <StyledMobileNavigation onClick={handleClick}>
      <Text>{title}</Text>
    </StyledMobileNavigation>
  );
};

MobileNavigation.propTypes = {
  title: PropTypes.string.isRequired
};

export default MobileNavigation;
