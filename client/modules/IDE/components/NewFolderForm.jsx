import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { remSize } from '../../../theme';
import hiddenElement from '../../../common/hiddenElement';
import Button from '../../../common/Button';
import { handleCreateFolder } from '../actions/files';

const NewFolderFormWrapper = styled.form``;
const NewFolderFormInputWrapper = styled.div`
  display: flex;
`;
const NewFolderFormLabel = styled.label([hiddenElement]);
const NewFolderFormInput = styled.input`
  margin-right: ${remSize(10)};
  flex: 1;
`;

function NewFolderForm() {
  const folderNameInput = useRef(null);
  useEffect(() => {
    folderNameInput.current.focus();
  });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  function validate(formProps) {
    const errors = {};
    if (!formProps.name) {
      errors.name = t('NewFolderModal.EnterName');
    } else if (formProps.name.trim().length === 0) {
      errors.name = t('NewFolderModal.EmptyName');
    } else if (formProps.name.match(/\.+/i)) {
      errors.name = t('NewFolderModal.InvalidExtension');
    }
    return errors;
  }

  function onSubmit(formProps) {
    return dispatch(handleCreateFolder(formProps));
  }

  return (
    <Form fields={['name']} validate={validate} onSubmit={onSubmit}>
      {({ handleSubmit, invalid, submitting, touched, errors }) => (
        <NewFolderFormWrapper onSubmit={handleSubmit}>
          <NewFolderFormInputWrapper>
            <Field name="name">
              {(field) => (
                <React.Fragment>
                  <NewFolderFormLabel htmlFor="name">Name:</NewFolderFormLabel>
                  <NewFolderFormInput
                    className="new-folder-form__name-input"
                    id="name"
                    type="text"
                    maxLength="128"
                    placeholder={t('NewFolderForm.Placeholder')}
                    ref={folderNameInput}
                    {...field.input}
                  />
                </React.Fragment>
              )}
            </Field>
            <Button type="submit" disabled={invalid || submitting}>
              {t('NewFolderForm.AddFolderSubmit')}
            </Button>
          </NewFolderFormInputWrapper>
          {touched.name && errors.name && (
            <span className="form-error">{errors.name}</span>
          )}
        </NewFolderFormWrapper>
      )}
    </Form>
  );
}

export default NewFolderForm;
