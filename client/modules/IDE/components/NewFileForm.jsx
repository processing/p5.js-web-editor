import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { handleCreateFile } from '../actions/files';
import { CREATE_FILE_REGEX } from '../../../../server/utils/fileUtils';

import Button from '../../../common/Button';

function NewFileForm() {
  const fileNameInput = useRef(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  function onSubmit(formProps) {
    return dispatch(handleCreateFile(formProps));
  }

  function validate(formProps) {
    const errors = {};

    if (!formProps.name) {
      errors.name = t('NewFileModal.EnterName');
    } else if (!formProps.name.match(CREATE_FILE_REGEX)) {
      errors.name = t('NewFileModal.InvalidType');
    }

    return errors;
  }

  useEffect(() => {
    fileNameInput.current.focus();
  });

  return (
    <Form
      fields={['name']}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit, errors, touched, invalid, submitting
      }) => (
        <form
          className="new-file-form"
          onSubmit={handleSubmit}
        >
          <div className="new-file-form__input-wrapper">
            <Field name="name">
              {field => (
                <React.Fragment>
                  <label className="new-file-form__name-label" htmlFor="name">
                    Name:
                  </label>
                  <input
                    className="new-file-form__name-input"
                    id="name"
                    type="text"
                    placeholder={t('NewFileForm.Placeholder')}
                    maxLength="128"
                    {...field.input}
                    ref={fileNameInput}
                  />
                </React.Fragment>
              )}
            </Field>
            <Button
              type="submit"
              disabled={invalid || submitting}
            >{t('NewFileForm.AddFileSubmit')}
            </Button>
          </div>
          {touched.name && errors.name && (
            <span className="form-error">{errors.name}</span>
          )}
        </form>
      )}
    </Form>
  );
}

export default NewFileForm;
