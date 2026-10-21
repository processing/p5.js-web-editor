export const renderAccountConsolidation = jest.fn().mockReturnValue({
  to: 'test@example.com',
  subject: 'Mock consolidate your email'
});
export const renderResetPassword = jest.fn().mockReturnValue({
  to: 'test@example.com',
  subject: 'Mock reset your password'
});
export const renderEmailConfirmation = jest.fn().mockReturnValue({
  to: 'test@example.com',
  subject: 'Mock confirm your email'
});
export const renderStepUpCode = jest.fn().mockReturnValue({
  to: 'test@example.com',
  subject: 'Mock step-up code'
});
export const renderEmailChangedNotice = jest.fn().mockReturnValue({
  to: 'old@example.com',
  subject: 'Mock email changed notice'
});
