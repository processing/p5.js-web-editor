import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { AnyAction } from 'redux';
import { Button, ButtonKinds, ButtonTypes } from '../../../common/Button';
import { deleteAccount } from '../actions';
import { RootState } from '../../../reducers';

export function DangerZone() {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const hasPassword = useSelector(
    (state: RootState) =>
      state.user.github === undefined && state.user.google === undefined
  );

  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await dispatch(
      deleteAccount(hasPassword ? { password } : {})
    );
    setIsSubmitting(false);
    if (result) {
      setError(result as string);
    }
  };

  const header = (
    <React.Fragment>
      <h2 className="form-container__divider">{t('DangerZone.Title')}</h2>
      <p className="account__social-text">
        {t('DangerZone.DeleteAccountDescription')}
      </p>
    </React.Fragment>
  );

  if (!isConfirming) {
    return (
      <div className="account__danger-zone">
        {header}
        <div className="account__social-stack">
          <Button
            kind={ButtonKinds.PRIMARY}
            onClick={() => setIsConfirming(true)}
          >
            {t('DangerZone.DeleteAccount')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="account__danger-zone">
      {header}
      <form className="form" onSubmit={handleDelete}>
        {hasPassword && (
          <p className="form__field">
            <label
              htmlFor="danger-zone-password"
              className="account__inline-label"
            >
              {t('DangerZone.PasswordLabel')}
            </label>
            <input
              className="form__input"
              aria-label={t('DangerZone.PasswordARIA')}
              id="danger-zone-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </p>
        )}
        {error && (
          <p className="form-error" aria-live="polite">
            {error}
          </p>
        )}
        <div className="account__action-stack">
          <Button
            kind={ButtonKinds.SECONDARY}
            type={ButtonTypes.BUTTON}
            onClick={() => {
              setIsConfirming(false);
              setPassword('');
              setError('');
            }}
            disabled={isSubmitting}
          >
            {t('DangerZone.Cancel')}
          </Button>
          <Button
            kind={ButtonKinds.PRIMARY}
            type={ButtonTypes.SUBMIT}
            disabled={isSubmitting || (hasPassword && password === '')}
          >
            {t('DangerZone.Confirm')}
          </Button>
        </div>
      </form>
    </div>
  );
}
