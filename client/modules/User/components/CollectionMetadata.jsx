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
import ShareURL from './CollectionShareButton';

function CollectionMetadata({ collection, isOwner }) {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const currentUsername = useSelector((state) => state.user.username);

  const [isAddingSketches, setIsAddingSketches] = useState(false);

  const { id, name, description, items, owner } = collection;
  const { username: ownerUsername } = owner;

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
            <Link to={`/${ownerUsername}/sketches`}>{ownerUsername}</Link>
          </p>

          <p className="collection-metadata__user">
            {t('Collection.NumSketches', { count: items.length })}
          </p>
        </div>

        <div className="collection-metadata__column--right">
          <ShareURL value={`${hostname}/${ownerUsername}/collections/${id}`} />
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
  collection: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    owner: PropTypes.shape({
      username: PropTypes.string
    }).isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  isOwner: PropTypes.bool.isRequired
};

export default CollectionMetadata;
