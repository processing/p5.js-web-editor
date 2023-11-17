import React from 'react';
import Modal from './Modal';

export default {
  title: 'IDE/Modal',
  component: Modal,
  argTypes: {
    onClose: { action: 'onClose' }
  }
};

export const ModalDefault = {
  args: {
    title: 'Example Modal Title',
    children: <p>Example modal body</p>
  }
};
