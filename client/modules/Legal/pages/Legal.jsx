import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import RouterTab from '../../../common/RouterTab';
import RootPage from '../../../components/RootPage';
import { remSize } from '../../../theme';
import Loader from '../../App/components/loader';
import Nav from '../../IDE/components/Header/Nav';
import PolicyContainer from '../components/PolicyContainer';

const StyledTabList = styled.nav`
  display: flex;
  max-width: ${remSize(700)};
  margin: 0 auto;
  padding: 0 ${remSize(10)};
  & ul {
    padding-top: ${remSize(10)};
    gap: ${remSize(19)};
  }
`;

function Legal({ policyFile, title }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState('');

  useEffect(() => {
    axios.get(policyFile).then((response) => {
      setPolicy(response.data);
      setIsLoading(false);
    });
  }, [policyFile]);

  return (
    <RootPage>
      {/* TODO: translate site name */}
      <Helmet>
        <title>p5.js Web Editor | {title}</title>
      </Helmet>
      <Nav layout="dashboard" />
      <StyledTabList className="dashboard-header__switcher">
        <ul className="dashboard-header__tabs">
          <RouterTab to="/privacy-policy">{t('Legal.PrivacyPolicy')}</RouterTab>
          <RouterTab to="/terms-of-use">{t('Legal.TermsOfUse')}</RouterTab>
          <RouterTab to="/code-of-conduct">
            {t('Legal.CodeOfConduct')}
          </RouterTab>
        </ul>
      </StyledTabList>
      <PolicyContainer policy={policy} />
      {isLoading && <Loader />}
    </RootPage>
  );
}

Legal.propTypes = {
  /**
   * Used in the HTML <title> tag.
   * TODO: pass this to the Nav to use as the mobile title.
   */
  title: PropTypes.string.isRequired,
  /**
   * Path of the markdown '.md' file, relative to the /public directory.
   */
  policyFile: PropTypes.string.isRequired
};

export default Legal;
