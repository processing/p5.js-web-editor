import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';

import Icons from './Icons';

const Item = ({ isAdded, onSelect, name, url, t }) => {
  const buttonLabel = isAdded
    ? t('QuickAddList.ButtonRemoveARIA')
    : t('QuickAddList.ButtonAddToCollectionARIA');
  return (
    <tr className="quick-add__item" onClick={onSelect}>
      {/* eslint-disable-line */}
      <td>
        <button
          className="quick-add__item-toggle"
          onClick={onSelect}
          aria-label={buttonLabel}
        >
          <Icons isAdded={isAdded} />
        </button>
      </td>
      <td>
        <span className="quick-add__item-name">{name}</span>
      </td>
      <td>
        <Link
          className="quick-add__item-view"
          to={url}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          {t('QuickAddList.View')}
        </Link>
      </td>
    </tr>
  );
};

Item.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isAdded: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(Item);
