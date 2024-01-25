import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../../common/Button';
import Overlay from '../../App/components/Overlay';
import { editCollection } from '../../IDE/actions/collections';
import AddToCollectionSketchList from '../../IDE/components/AddToCollectionSketchList';
import EditableInput from '../../IDE/components/EditableInput';
import { SketchSearchbar } from '../../IDE/components/Searchbar';
import { getCollection } from '../../IDE/selectors/collections';
import ShareURL from './CollectionShareButton';

function CollectionMetadata({ collectionId }) {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const collection = useSelector((state) => getCollection(state, collectionId));
  const currentUsername = useSelector((state) => state.user.username);

  const [isAddingSketches, setIsAddingSketches] = useState(false);

  if (!collection) {
    return null;
  }

  const { id, name, description, items, owner } = collection;
  const { username } = owner;
  const isOwner = !!currentUsername && currentUsername === username;

  const hostname = window.location.origin;

  const handleEditCollectionName = (value) => {
    if (value === name) {
      return;
    }
    dispatch(editCollection(id, { name: value }));
  };

  const handleEditCollectionDescription = (value) => {
    if (value === description) {
      return;
    }
    dispatch(editCollection(id, { description: value }));
  };

  // TODO: Implement UI for editing slug

  return (
    <header
      className={classNames(
        'collection-metadata',
        isOwner && 'collection-metadata--is-owner'
      )}
    >
      <div className="collection-metadata__columns">
        <div className="collection-metadata__column--left">
          <h2 className="collection-metadata__name">
            {isOwner ? (
              <EditableInput
                value={name}
                onChange={handleEditCollectionName}
                validate={(value) => value !== ''}
              />
            ) : (
              name
            )}
          </h2>

          <p className="collection-metadata__description">
            {isOwner ? (
              <EditableInput
                InputComponent="textarea"
                value={description}
                onChange={handleEditCollectionDescription}
                emptyPlaceholder={t('Collection.DescriptionPlaceholder')}
              />
            ) : (
              description
            )}
          </p>

          <p className="collection-metadata__user">
            {t('Collection.By')}
            <Link to={`/${username}/sketches`}>{username}</Link>
          </p>

          <p className="collection-metadata__user">
            {t('Collection.NumSketches', { count: items.length })}
          </p>
        </div>

        <div className="collection-metadata__column--right">
          <ShareURL value={`${hostname}/${username}/collections/${id}`} />
          {isOwner && (
            <Button onClick={() => setIsAddingSketches(true)}>
              {t('Collection.AddSketch')}
            </Button>
          )}
        </div>
      </div>
      {isAddingSketches && (
        <Overlay
          title={t('Collection.AddSketch')}
          actions={<SketchSearchbar />}
          closeOverlay={() => setIsAddingSketches(false)}
          isFixedHeight
        >
          <AddToCollectionSketchList collection={collection} />
        </Overlay>
      )}
    </header>
  );
}

CollectionMetadata.propTypes = {
  collectionId: PropTypes.string.isRequired
};

export default CollectionMetadata;
