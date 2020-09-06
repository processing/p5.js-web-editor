import PropTypes from 'prop-types';
import React from 'react';
import orderBy from 'lodash/orderBy';

import { APIKeyPropType } from './APIKeyForm';

import dates from '../../../utils/formatDate';
import TrashCanIcon from '../../../images/trash-can.svg';

function APIKeyList({ apiKeys, onRemove, t }) {
  return (
    <table className="api-key-list">
      <thead>
        <tr>
          <th>{t('APIKeyList.Name')}</th>
          <th>{t('APIKeyList.Created')}</th>
          <th>{t('APIKeyList.LastUsed')}</th>
          <th>{t('APIKeyList.Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {orderBy(apiKeys, ['createdAt'], ['desc']).map((key) => {
          const lastUsed = key.lastUsedAt ?
            dates.distanceInWordsToNow(new Date(key.lastUsedAt)) :
            t('APIKeyList.Never');

          return (
            <tr key={key.id}>
              <td>{key.label}</td>
              <td>{dates.format(key.createdAt)}</td>
              <td>{lastUsed}</td>
              <td className="api-key-list__action">
                <button
                  className="api-key-list__delete-button"
                  onClick={() => onRemove(key)}
                  aria-label={t('APIKeyList.DeleteARIA')}
                >
                  <TrashCanIcon focusable="false" aria-hidden="true" />
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
  t: PropTypes.func.isRequired
};

export default APIKeyList;
