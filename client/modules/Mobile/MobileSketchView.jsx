import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ExitIcon } from '../../common/icons';
import Footer from '../../components/mobile/Footer';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import Screen from '../../components/mobile/MobileScreen';
import { startSketch, stopSketch } from '../IDE/actions/ide';
import Console from '../IDE/components/Console';
import PreviewFrame from '../IDE/components/PreviewFrame';
import Content from './MobileViewContent';

const MobileSketchView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startSketch());
    return () => {
      dispatch(stopSketch());
    };
  }, [dispatch]);

  const projectName = useSelector((state) => state.project.name);

  return (
    <Screen>
      <Header
        leftButton={
          <IconButton to="/" icon={ExitIcon} aria-label={t('Nav.BackEditor')} />
        }
        title={projectName}
      />
      <Content>
        <PreviewFrame />
      </Content>
      <Footer>
        <Console />
      </Footer>
    </Screen>
  );
};

export default MobileSketchView;
