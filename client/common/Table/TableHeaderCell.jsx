import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DIRECTION } from '../../modules/IDE/actions/sorting';
import { prop, remSize } from '../../theme';
import { SortArrowDownIcon, SortArrowUpIcon } from '../icons';

const opposite = (direction) =>
  direction === DIRECTION.ASC ? DIRECTION.DESC : DIRECTION.ASC;

const ariaSort = (direction) =>
  direction === DIRECTION.ASC ? 'ascending' : 'descending';

const TableHeaderTitle = styled.span`
  border-bottom: 2px dashed transparent;
  padding: ${remSize(3)} 0;
  color: ${prop('inactiveTextColor')};
  ${(props) => props.selected && `border-color: ${prop('accentColor')(props)}`}
`;

export const StyledHeaderCell = styled.th`
  height: ${remSize(32)};
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: ${prop('backgroundColor')};
  font-weight: normal;
  &:nth-child(1) {
    padding-left: ${remSize(12)};
  }
  button {
    display: flex;
    align-items: center;
    height: ${remSize(35)};
    svg {
      margin-left: ${remSize(8)};
      fill: ${prop('inactiveTextColor')};
    }
  }
`;

const TableHeaderCell = ({ sorting, field, title, defaultOrder, onSort }) => {
  const isSelected = sorting.field === field;
  const { direction } = sorting;
  const { t } = useTranslation();
  const directionWhenClicked = isSelected ? opposite(direction) : defaultOrder;
  // TODO: more generic translation properties
  const translationKey =
    directionWhenClicked === DIRECTION.ASC
      ? 'SketchList.ButtonLabelAscendingARIA'
      : 'SketchList.ButtonLabelDescendingARIA';
  const buttonLabel = t(translationKey, {
    displayName: title
  });

  return (
    <StyledHeaderCell
      scope="col"
      aria-sort={isSelected ? ariaSort(direction) : null}
    >
      <button
        onClick={() => onSort({ field, direction: directionWhenClicked })}
        aria-label={buttonLabel}
        aria-pressed={isSelected}
      >
        <TableHeaderTitle selected={isSelected}>{title}</TableHeaderTitle>
        {/* TODO: show icons on hover of cell */}
        {isSelected && direction === DIRECTION.ASC && (
          <SortArrowUpIcon
            aria-label={t('SketchList.DirectionAscendingARIA')}
          />
        )}
        {isSelected && direction === DIRECTION.DESC && (
          <SortArrowDownIcon
            aria-label={t('SketchList.DirectionDescendingARIA')}
          />
        )}
      </button>
    </StyledHeaderCell>
  );
};

TableHeaderCell.propTypes = {
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  field: PropTypes.string.isRequired,
  title: PropTypes.string,
  defaultOrder: PropTypes.oneOf([DIRECTION.ASC, DIRECTION.DESC]),
  onSort: PropTypes.func.isRequired
};

TableHeaderCell.defaultProps = {
  title: '',
  defaultOrder: DIRECTION.ASC
};

export default TableHeaderCell;
