import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkSlug from 'remark-slug';
import PropTypes from 'prop-types';
import { remSize, prop } from '../../../theme';

const PolicyContainerMain = styled.main`
  max-width: ${remSize(700)};
  min-height: 100vh;
  margin: 0 auto;
  padding: ${remSize(10)};
  line-height: 1.5em;
  & p {
    margin-bottom: ${remSize(10)};
  }
  font-size: ${remSize(16)};
  & h1 {
    font-size: 2em;
  }
  & h2 {
    font-size: 1.5em;
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
  }
  & h3 {
    font-size: 1.17em;
    margin-block-start: 1em;
    margin-block-end: 1em;
    font-weight: bold;
  }
  & ul {
    list-style: initial;
    padding-inline-start: 40px;
    margin-block-start: 1em;
    margin-block-end: 1em;
  }
  & a {
    color: ${prop('Policy.link')};
  }

  @media (max-width: 770px) {
    overflow: auto;
    min-height: unset;
  }
`;

function PolicyContainer({ policy }) {
  return (
    <PolicyContainerMain>
      <ReactMarkdown remarkPlugins={[remarkSlug]}>{policy}</ReactMarkdown>
    </PolicyContainerMain>
  );
}

PolicyContainer.propTypes = {
  policy: PropTypes.string.isRequired
};

export default PolicyContainer;
