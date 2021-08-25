import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import Nav from '../../../components/Nav';
import PolicyContainer from '../components/PolicyContainer';

function TermsOfUse() {
  const [termsOfUse, setTermsOfUse] = useState('');
  useEffect(() => {
    axios.get('terms-of-use.md').then((response) => {
      setTermsOfUse(response.data);
    });
  }, []);
  return (
    <>
      <Helmet>
        <title>Terms of Use</title>
      </Helmet>
      <Nav layout="dashboard" />
      <PolicyContainer policy={termsOfUse} />
    </>
  );
}

export default TermsOfUse;
