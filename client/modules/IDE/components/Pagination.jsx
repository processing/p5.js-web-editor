import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  limit,
  totalCollections,
  isOverlay
}) => {
  if (totalPages <= 1) return null;

  const { t } = useTranslation();

  const startCollection = (page - 1) * limit + 1;
  const endCollection = Math.min(page * limit, totalCollections);

  return (
    <div className={`pagination ${isOverlay ? 'pagination-overlay' : ''}`}>
      <ul className="pagination-ul">
        <li className="page-item">
          <button
            className="page-link"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous Page"
          >
            {t('Pagination.Previous')}
          </button>
        </li>

        <li className="pagination-info">
          <span>
            <span className="bold-text">
              {startCollection} - {endCollection}
            </span>{' '}
            {t('Pagination.Of')} {totalCollections}
          </span>
        </li>
        <li
          className={classNames('page-item', {
            disabled: page === totalPages
          })}
        >
          <button
            className="page-link"
            onClick={() => {
              onPageChange(page + 1);
            }}
            disabled={page === totalPages}
            aria-label="Next Page"
          >
            {t('Pagination.Next')}
          </button>
        </li>
      </ul>
    </div>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  totalCollections: PropTypes.number.isRequired,
  isOverlay: PropTypes.bool
};

Pagination.defaultProps = {
  isOverlay: false
};

export default Pagination;
