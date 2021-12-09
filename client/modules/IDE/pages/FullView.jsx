import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
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

function FullView(props) {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    dispatch(getProject(props.params.project_id, props.params.username));
  }, []);

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
          id: props.params.project_id
        }}
      />
      <main className="preview-frame-holder">
        <PreviewFrame fullView />
      </main>
    </RootPage>
  );
}

FullView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired
};

export default FullView;
