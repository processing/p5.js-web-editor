import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import QuickAddList from './QuickAddList';
import {
  CollectionAddSketchWrapper,
  QuickAddWrapper
} from './AddToCollectionList';
import {
  sendSketchRequest,
  getYourRequests,
  declineRequest
} from '../actions/collections';

const SketchList = ({
  user,
  getProjects,
  sketches,
  collection,
  collectionOwner,
  currentUsername,
  username,
  loading,
  sorting,
  t
}) => {
  const [isInitialDataLoad, setIsInitialDataLoad] = useState(true);
  const [messages, setMessages] = React.useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getProjects(currentUsername);
  }, [currentUsername, getProjects]);

  useEffect(() => {
    if (sketches && Array.isArray(sketches)) {
      setIsInitialDataLoad(false);
    }
  }, [sketches]);

  const getMsgs = async () => {
    try {
      const data = await dispatch(getYourRequests());
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    getMsgs();
  }, [currentUsername]);

  const getSketchesTitle = () => {
    if (username === user.username) {
      return t('Message.SendReqToAddSketches');
    }
    return t('Message.SendReqToAddSketches', {
      anotheruser: username
    });
  };

  const handleSendingRequest = (sketch) => {
    dispatch(sendSketchRequest(collection.id, sketch.id, collectionOwner));
    getMsgs();
  };

  const handleRequestRemove = (sketch) => {
    dispatch(declineRequest(collection.id, sketch.id));
    getMsgs();
  };

  // find if there has already been sent the same project request by current user
  const findInRequest = (sketch) =>
    messages.find((msg) =>
      msg.isDeleted ? false : msg.projectID === sketch.id
    ) != null;

  const hasSketches = sketches.length > 0;

  const sketchesWithMessages = sketches.map((sketch) => ({
    ...sketch,
    isAdded: findInRequest(sketch)
  }));
  let content = null;

  if (loading && isInitialDataLoad) {
    content = <Loader />;
  } else if (hasSketches) {
    content = (
      <QuickAddList
        items={sketchesWithMessages}
        onAdd={handleSendingRequest}
        onRemove={handleRequestRemove}
      />
    );
  } else {
    content = t('AddToCollectionSketchList.NoCollections');
  }

  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{getSketchesTitle()}</title>
        </Helmet>
        {content}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        project: PropTypes.shape({
          id: PropTypes.string.isRequired
        })
      })
    )
  }).isRequired,
  collectionOwner: PropTypes.string.isRequired,
  currentUsername: PropTypes.string.isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  t: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  username: undefined
};

const mapStateToProps = (state) => ({
  user: state.user,
  sketches: getSortedSketches(state),
  sorting: state.sorting,
  loading: state.loading,
  project: state.project
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ...ProjectsActions,
      ...CollectionsActions,
      ...ToastActions,
      ...SortingActions
    },
    dispatch
  );

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
