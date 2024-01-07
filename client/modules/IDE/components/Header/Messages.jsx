import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React from 'react';
import {
  CollectionAddSketchWrapper,
  QuickAddWrapper
} from '../AddToCollectionList';
import {
  addToCollection,
  disallowReq,
  getMessages
} from '../../actions/collections';
import Button from '../../../../common/Button';

const Messages = () => {
  const [msgs, setMsgs] = React.useState([]);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  React.useEffect(() => {
    const getMsgs = async () => {
      try {
        const data = await dispatch(getMessages());
        setMsgs(data);
      } catch (error) {
        console.error(error);
      }
    };
    getMsgs();
  }, []);

  const allowProject = (msgindex) => {
    const { collectionID, projectID } = msgindex;
    console.log(collectionID, projectID);
    try {
      dispatch(addToCollection(collectionID, projectID));
    } catch (error) {
      console.error(error);
    }
  };

  const disallowProject = (singleMsg) => {
    const { collectionID, projectID } = singleMsg;
    console.log(collectionID, projectID);

    try {
      dispatch(disallowReq(collectionID, projectID));
    } catch (error) {
      console.log(error);
    }
  };
  console.log(msgs);
  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{t('Message.Messages')}</title>
        </Helmet>

        {msgs.map((msg, index) => (
          <div className="messages__add">
            <div className="messages__msg">
              <p>{msg.msg}</p>
              <a href={`/${msg.reqSender}/sketches/${msg.projectID}`}>
                {t('Message.View')}
              </a>
            </div>
            <div className="messages__buttons">
              <Button onClick={() => allowProject(msg)}>
                {t('Message.Accept')}
              </Button>
              <Button onClick={() => disallowProject(msg)}>
                {t('Message.Reject')}
              </Button>
            </div>
          </div>
        ))}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

export default Messages;
