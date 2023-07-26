import ErrorModal from './ErrorModal';

export default {
  title: 'IDE/ErrorModal',
  component: ErrorModal,
  argTypes: {
    closeModal: { action: 'closed' }
  }
};

export const ForceAuthenticationErrorModal = {
  args: {
    type: 'forceAuthentication'
  }
};
export const StaleSessionErrorModal = {
  args: {
    type: 'staleSession'
  }
};
export const StaleProjectErrorModal = {
  args: {
    type: 'staleProject'
  }
};
export const OauthErrorModal = {
  args: {
    type: 'oauthError'
  }
};
