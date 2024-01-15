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

  const getMsgs = async () => {
    try {
      const data = await dispatch(getMessages());
      setMsgs(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    getMsgs();
  }, []);

  const allowProject = (msgindex) => {
    const { collectionID, projectID } = msgindex;
    try {
      dispatch(addToCollection(collectionID, projectID));
      getMsgs();
    } catch (error) {
      console.error(error);
    }
  };

  const disallowProject = (singleMsg) => {
    const { collectionID, projectID } = singleMsg;

    try {
      dispatch(disallowReq(collectionID, projectID));
      getMsgs();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{t('Message.Messages')}</title>
        </Helmet>
        {msgs.length === 0 && <p>{t('Message.NoMsg')}`</p>}
        {msgs.map((msg, index) => (
          <ul className="messages__add">
            <li className="messages__list">
              <div className="messages__msg">
                <p>{msg.msg}</p>
                <a
                  className="messages__view"
                  href={`/${msg.reqSender}/sketches/${msg.projectID}`}
                >
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
            </li>
          </ul>
        ))}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

export default Messages;
