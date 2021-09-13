import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { browserHistory } from 'react-router';
import styled from 'styled-components';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';
import RootPage from '../../../components/RootPage';
import Nav from '../../../components/Nav';
import { remSize, prop } from '../../../theme';

const StyledTabList = styled(TabList)`
  display: flex;
  max-width: ${remSize(680)};
  padding-top: ${remSize(10)};
  margin: 0 auto;
  border-bottom: 1px solid ${prop('Modal.separator')};
`;

const TabTitle = styled.p`
  padding: 0 ${remSize(5)} ${remSize(5)} ${remSize(5)};
  cursor: pointer;
  color: ${prop('inactiveTextColor')};
  &:hover,
  &:focus {
    color: ${prop('primaryTextColor')};
  }
`;

function Legal({ location }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    if (location.pathname === '/privacy-policy') {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(1);
    }
  }, [location]);

  function onSelect(index, lastIndex, event) {
    if (index === lastIndex) return;
    if (index === 0) {
      setSelectedIndex(0);
      browserHistory.push('/privacy-policy');
    } else if (index === 1) {
      setSelectedIndex(1);
      browserHistory.push('/terms-of-use');
    }
  }

  return (
    <RootPage>
      <Nav layout="dashboard" />
      <Tabs selectedIndex={selectedIndex} onSelect={onSelect}>
        <StyledTabList>
          <Tab>
            <TabTitle>Privacy Policy</TabTitle>
          </Tab>
          <Tab>
            <TabTitle>Terms of Use</TabTitle>
          </Tab>
        </StyledTabList>
        <TabPanel>
          <PrivacyPolicy />
        </TabPanel>
        <TabPanel>
          <TermsOfUse />
        </TabPanel>
      </Tabs>
    </RootPage>
  );
}

Legal.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired
};

export default Legal;
