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

function FullView(props) {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(getProject(props.params.project_id, props.params.username));
  }, []);

  // send register event until iframe is loaded and sends a message back.
  const [isRendered, setIsRendered] = useState(false);
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
    <div className="fullscreen-preview">
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
    </div>
  );
}

FullView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired
};

export default FullView;
