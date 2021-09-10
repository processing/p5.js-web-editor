import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
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
        <title>p5.js Web Editor | Terms of Use</title>
      </Helmet>
      <PolicyContainer policy={termsOfUse} />
    </>
  );
}

export default TermsOfUse;
