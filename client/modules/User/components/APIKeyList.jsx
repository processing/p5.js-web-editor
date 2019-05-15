import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import format from 'date-fns/format';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import orderBy from 'lodash/orderBy';

import { APIKeyPropType } from './APIKeyForm';

const trashCan = require('../../../images/trash-can.svg');

function APIKeyList({ apiKeys, onRemove }) {
  return (
    <table className="api-key-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Created on</th>
          <th>Last used</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orderBy(apiKeys, ['createdAt'], ['desc']).map((key) => {
          const lastUsed = key.lastUsedAt ? distanceInWordsToNow(new Date(key.lastUsedAt), { addSuffix: true }) : 'Never';

          return (
            <tr key={key.id}>
              <td>{key.label}</td>
              <td>{format(new Date(key.createdAt), 'MMM D, YYYY h:mm A')}</td>
              <td>{lastUsed}</td>
              <td className="api-key-list__action">
                <button className="api-key-list__delete-button" onClick={() => onRemove(key)}>
                  <InlineSVG src={trashCan} alt="Delete Key" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

APIKeyList.propTypes = {
  apiKeys: PropTypes.arrayOf(PropTypes.shape(APIKeyPropType)).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default APIKeyList;
