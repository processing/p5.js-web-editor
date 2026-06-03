import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { OpenProcessingButton } from '../components/OpenProcessingButton';
import Nav from '../../IDE/components/Header/Nav';
import { RootPage } from '../../../components/RootPage';
import { remSize } from '../../../theme';

const Intro = styled.p`
  max-width: ${remSize(360)};
  margin: 0 auto ${remSize(20)};
  text-align: center;
  font-size: ${remSize(14)};
  line-height: 1.5;
  color: #555;
`;

export function LoginView() {
  const { t } = useTranslation();
  return (
    <RootPage>
      <Nav layout="dashboard" />
      <main className="form-container">
        <Helmet>
          <title>{t('LoginView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{t('LoginView.Login')}</h2>
          <Intro>
            All user accounts migrated to OpenProcessing. Continue below to
            login with your existing account or create a new one.
          </Intro>
          <div
            className="form-container__stack"
            style={{ textAlign: 'center' }}
          >
            <OpenProcessingButton />
          </div>
        </div>
      </main>
    </RootPage>
  );
}
