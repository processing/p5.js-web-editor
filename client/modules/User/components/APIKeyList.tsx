import React from 'react';
import { orderBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import type { SanitisedApiKey } from '../../../../common/types';
import {
  distanceInWordsToNow,
  formatDateToString
} from '../../../utils/formatDate';
import TrashCanIcon from '../../../images/trash-can.svg';

export interface APIKeyListProps {
  apiKeys: SanitisedApiKey[];
  onRemove: (key: SanitisedApiKey) => void;
}
export function APIKeyList({ apiKeys, onRemove }: APIKeyListProps) {
  const { t } = useTranslation();
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
          const lastUsed = key.lastUsedAt
            ? distanceInWordsToNow(new Date(key.lastUsedAt))
            : t('APIKeyList.Never');

          return (
            <tr key={key.id}>
              <td>{key.label}</td>
              <td>{formatDateToString(key.createdAt)}</td>
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
