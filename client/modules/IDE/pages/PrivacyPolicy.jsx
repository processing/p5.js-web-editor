import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import Nav from '../../../components/Nav';
import PolicyContainer from '../components/PolicyContainer';
import RootPage from '../../../components/RootPage';

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
      <RootPage>
        <Nav layout="dashboard" />
        <PolicyContainer policy={privacyPolicy} />
      </RootPage>
    </>
  );
}

export default PrivacyPolicy;
