import React from 'react';

import ErrorModal from './ErrorModal';

export default {
  title: 'IDE/ErrorModal',
  component: ErrorModal,
  argTypes: {
    type: {
      options: [
        'forceAuthentication',
        'staleSession',
        'staleProject',
        'oauthError'
      ],
      control: { type: 'select' }
    },
    service: {
      options: ['google', 'github'],
      control: { type: 'select' }
    },
    closeModal: { action: 'closed' }
  }
};

const Template = (args) => <ErrorModal {...args} />;

export const ForceAuthenticationErrorModal = Template.bind({});
ForceAuthenticationErrorModal.args = {
  type: 'forceAuthentication'
};

export const StaleSessionErrorModal = Template.bind({});
StaleSessionErrorModal.args = {
  type: 'staleSession'
};

export const StaleProjectErrorModal = Template.bind({});
StaleProjectErrorModal.args = {
  type: 'staleProject'
};

export const OauthErrorModal = Template.bind({});
OauthErrorModal.args = {
  type: 'oauthError',
  service: 'google'
};
