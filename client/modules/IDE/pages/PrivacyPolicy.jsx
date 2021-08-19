import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkSlug from 'remark-slug';
import styled from 'styled-components';
import axios from 'axios';
import Nav from '../../../components/Nav';
import { remSize } from '../../../theme';

const PrivacyPolicyContainer = styled.main`
  max-width: ${remSize(700)};
  margin: 0 auto;
  padding: ${remSize(10)};
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
`;

function PrivacyPolicy() {
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  useEffect(() => {
    axios.get('privacy-policy.md').then((response) => {
      setPrivacyPolicy(response.data);
    });
  }, []);
  return (
    <>
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>
      <Nav layout="dashboard" />
      <PrivacyPolicyContainer>
        <ReactMarkdown remarkPlugins={[remarkSlug]}>
          {privacyPolicy}
        </ReactMarkdown>
      </PrivacyPolicyContainer>
    </>
  );
}

export default PrivacyPolicy;
