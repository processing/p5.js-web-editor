import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
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
        <title>p5.js Web Editor | Privacy Policy</title>
      </Helmet>
      <PolicyContainer policy={privacyPolicy} />
    </>
  );
}

export default PrivacyPolicy;
