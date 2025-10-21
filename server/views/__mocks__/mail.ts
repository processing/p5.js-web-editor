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
