import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import Nav from '../../../components/Nav';
import PolicyContainer from '../components/PolicyContainer';

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
      <PolicyContainer policy={privacyPolicy} />
    </>
  );
}

export default PrivacyPolicy;
