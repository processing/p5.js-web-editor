import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import Nav from '../../../components/Nav';
import PolicyContainer from '../components/PolicyContainer';
import RootPage from '../../../components/RootPage';

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
      <RootPage>
        <Nav layout="dashboard" />
        <PolicyContainer policy={termsOfUse} />
      </RootPage>
    </>
  );
}

export default TermsOfUse;
