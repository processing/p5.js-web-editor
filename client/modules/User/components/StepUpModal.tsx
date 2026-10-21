import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Overlay } from '../../App/components/Overlay';
import { Button, ButtonTypes } from '../../../common/Button';
import type { RootState } from '../../../reducers';
import {
  sendStepUpCode,
  setStepUpExpiry,
  verifyStepUpCode,
  verifyStepUpPassword
} from '../stepUp';

const RESEND_COOLDOWN_SECONDS = 60;

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

function getServerMessage(error: any): string {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    ''
  );
}

export function StepUpModal({ isOpen, onClose, onVerified }: StepUpModalProps) {
  const { t } = useTranslation();
  const hasPassword = useSelector(
    (state: RootState) => !!(state.user as any).hasPassword
  );

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setCode('');
      setError('');
      setSubmitting(false);
      setSendingCode(false);
      // Keep codeSent/cooldown across re-opens within the same page view
      // so the 60s resend limit stays visible.
    }
  }, [isOpen, hasPassword]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [cooldown]);

  if (!isOpen) {
    return null;
  }

  const getSendCodeLabel = () => {
    if (cooldown > 0) {
      return t('StepUp.SendCodeWait', { seconds: cooldown });
    }
    if (codeSent) {
      return t('StepUp.ResendCode');
    }
    return t('StepUp.SendCode');
  };

  const handlePasswordSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await verifyStepUpPassword(password);
      setStepUpExpiry(response.data.expiresAt);
      setPassword('');
      onVerified();
    } catch (err: any) {
      const status = err?.response?.status;
      setError(
        status === 401
          ? t('StepUp.IncorrectPassword')
          : getServerMessage(err) || t('StepUp.VerifyFailed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCode = async () => {
    setSendingCode(true);
    setError('');
    try {
      await sendStepUpCode();
      setCodeSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError(t('StepUp.CodeResendWait'));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (status === 400) {
        setError(t('StepUp.PasswordAccountMessage'));
      } else {
        setError(getServerMessage(err) || t('StepUp.SendFailed'));
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleCodeSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await verifyStepUpCode(code.trim());
      setStepUpExpiry(response.data.expiresAt);
      setCode('');
      onVerified();
    } catch (err: any) {
      setError(t('StepUp.IncorrectCode'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay
      title={t('StepUp.Title')}
      ariaLabel={t('StepUp.Title')}
      closeOverlay={onClose}
    >
      <div className="stepup-modal form">
        <p className="form__context">{t('StepUp.Description')}</p>
        {hasPassword ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className="stepup-modal__section">
              <p className="form__field">
                <label htmlFor="stepup-password" className="form__label">
                  {t('StepUp.PasswordLabel')}
                </label>
                <input
                  className="form__input"
                  id="stepup-password"
                  type="password"
                  autoComplete="current-password"
                  aria-label={t('StepUp.PasswordLabel')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </p>
              {error && (
                <span className="form-error" aria-live="polite">
                  {error}
                </span>
              )}
            </div>
            <div className="stepup-modal__section stepup-modal__actions">
              <Button
                type={ButtonTypes.SUBMIT}
                disabled={submitting || password.length === 0}
              >
                {submitting ? t('StepUp.Verifying') : t('StepUp.Verify')}
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="stepup-modal__section">
              <Button
                onClick={handleSendCode}
                disabled={sendingCode || cooldown > 0}
              >
                {getSendCodeLabel()}
              </Button>
            </div>
            {codeSent && (
              <p className="form__context">{t('StepUp.CodeSentMessage')}</p>
            )}
            <form onSubmit={handleCodeSubmit}>
              <div className="stepup-modal__section">
                <p className="form__field">
                  <label htmlFor="stepup-code" className="form__label">
                    {t('StepUp.CodeLabel')}
                  </label>
                  <input
                    className="form__input"
                    id="stepup-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={t('StepUp.CodeLabel')}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </p>
                {error && (
                  <span className="form-error" aria-live="polite">
                    {error}
                  </span>
                )}
              </div>
              <div className="stepup-modal__section stepup-modal__actions">
                <Button
                  type={ButtonTypes.SUBMIT}
                  disabled={submitting || code.trim().length === 0}
                >
                  {submitting ? t('StepUp.Verifying') : t('StepUp.Verify')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Overlay>
  );
}
