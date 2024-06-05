import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { generateCollectionName } from '../../../utils/generateRandomName';
import Button from '../../../common/Button';
import { createCollection } from '../../IDE/actions/collections';

const CollectionCreate = () => {
  const generatedCollectionName = useMemo(() => generateCollectionName(), []);

  const [name, setName] = useState(generatedCollectionName);
  const [description, setDescription] = useState('');

  // TODO: error is never set!
  // eslint-disable-next-line no-unused-vars
  const [creationError, setCreationError] = useState();

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const handleCreateCollection = (event) => {
    event.preventDefault();

    dispatch(createCollection({ name, description }));
  };

  const invalid = name === '' || name == null;

  return (
    <div className="collection-create">
      <Helmet>
        <title>{t('CollectionCreate.Title')}</title>
      </Helmet>
      <div className="sketches-table-container">
        <form className="form" onSubmit={handleCreateCollection}>
          {creationError && (
            <span className="form-error">
              {t('CollectionCreate.FormError')}
            </span>
          )}
          <p className="form__field">
            <label htmlFor="name" className="form__label">
              {t('CollectionCreate.FormLabel')}
            </label>
            <input
              className="form__input"
              aria-label={t('CollectionCreate.FormLabelARIA')}
              type="text"
              id="name"
              value={name}
              placeholder={generatedCollectionName}
              onChange={(e) => setName(e.target.value)}
            />
            {invalid && (
              <span className="form-error">
                {t('CollectionCreate.NameRequired')}
              </span>
            )}
          </p>
          <p className="form__field">
            <label htmlFor="description" className="form__label">
              {t('CollectionCreate.Description')}
            </label>
            <textarea
              className="form__input form__input-flexible-height"
              aria-label={t('CollectionCreate.DescriptionARIA')}
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('CollectionCreate.DescriptionPlaceholder')}
              rows="6"
            />
          </p>
          <Button type="submit" disabled={invalid}>
            {t('CollectionCreate.SubmitCollectionCreate')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CollectionCreate;
