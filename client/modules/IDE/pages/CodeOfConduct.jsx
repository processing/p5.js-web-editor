import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';
import PolicyContainer from '../components/PolicyContainer';

function CodeOfConduct() {
  const [codeOfConduct, setCodeOfConduct] = useState('');
  useEffect(() => {
    axios.get('code-of-conduct.md').then((response) => {
      setCodeOfConduct(response.data);
    });
  }, []);
  return (
    <>
      <Helmet>
        <title>p5.js Web Editor | Code of Conduct</title>
      </Helmet>
      <PolicyContainer policy={codeOfConduct} />
    </>
  );
}

export default CodeOfConduct;
