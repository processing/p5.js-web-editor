import React from 'react';
import { getMessages } from '../../actions/collections';

// eslint-disable-next-line react/prop-types
const Messages = ({ owner }) => {
  const msgs = getMessages(owner);
  return (
    <div>
      {msgs.map((msg) => (
        <div>fjklds</div>
      ))}
    </div>
  );
};

export default Messages;
