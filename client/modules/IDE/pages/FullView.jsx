import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PreviewFrame from '../components/PreviewFrame';
import PreviewNav from '../../../components/PreviewNav';
import { getProject } from '../actions/project';
import { startSketch } from '../actions/ide';
import {
  listen,
  dispatchMessage,
  MessageTypes
} from '../../../utils/dispatcher';
import useInterval from '../hooks/useInterval';
import RootPage from '../../../components/RootPage';

function FullView() {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project);
  const [isRendered, setIsRendered] = useState(false);
  const params = useParams();

  useEffect(() => {
    dispatch(getProject(params.project_id, params.username));
  }, [params]);

  useEffect(() => {
    // if (isRendered) prevents startSketch() from being called twice
    // this calls startSketch if REGISTER happens before sketch is fetched
    if (isRendered) {
      dispatch(startSketch());
    }
  }, [project.id]);

  // send register event until iframe is loaded and sends a message back.
  const clearInterval = useInterval(() => {
    dispatchMessage({ type: MessageTypes.REGISTER });
  }, 100);
  if (isRendered) {
    clearInterval();
  }

  function handleMessageEvent(message) {
    if (message.type === MessageTypes.REGISTER) {
      if (!isRendered) {
        setIsRendered(true);
        dispatch(startSketch());
      }
    }
  }
  useEffect(() => {
    const unsubscribe = listen(handleMessageEvent);
    return function cleanup() {
      unsubscribe();
    };
  }, []);
  return (
    <RootPage fixedHeight="100%">
      <Helmet>
        <title>{project.name}</title>
      </Helmet>
      <PreviewNav
        owner={{
          username: project.owner ? `${project.owner.username}` : ''
        }}
        project={{
          name: project.name,
          id: params.project_id
        }}
      />
      <main className="preview-frame-holder">
        <PreviewFrame fullView />
      </main>
    </RootPage>
  );
}

export default FullView;
