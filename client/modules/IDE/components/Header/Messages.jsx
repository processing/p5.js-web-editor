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
  declineRequest,
  getOthersRequests
} from '../../actions/collections';
import Button from '../../../../common/Button';

const Messages = () => {
  const [msgs, setMsgs] = React.useState([]);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const getMsgs = async () => {
    try {
      const data = await dispatch(getOthersRequests());
      setMsgs(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    getMsgs();
  }, []);

  const allowRequest = (msgindex) => {
    const { collectionID, projectID } = msgindex;
    try {
      dispatch(addToCollection(collectionID, projectID));
      getMsgs();
    } catch (error) {
      console.error(error);
    }
  };

  const disallowRequest = (singleMsg) => {
    const { collectionID, projectID } = singleMsg;
    try {
      dispatch(declineRequest(collectionID, projectID));
      getMsgs();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{t('Message.Messages')}</title>
        </Helmet>
        {msgs.length === 0 && <p>{t('Message.NoMsg')}</p>}
        {msgs.map((msg, index) => (
          <ul className="messages__add">
            <li className="messages__list">
              <div className="messages__msg">
                <p>{msg.msg}</p>
                <a
                  className="messages__view"
                  href={`/${msg.reqSenderUsername}/sketches/${msg.projectID}`}
                >
                  {t('Message.View')}
                </a>
              </div>
              <div className="messages__buttons">
                <Button onClick={() => allowRequest(msg)}>
                  {t('Message.Accept')}
                </Button>
                <Button onClick={() => disallowRequest(msg)}>
                  {t('Message.Reject')}
                </Button>
              </div>
            </li>
          </ul>
        ))}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

export default Messages;
