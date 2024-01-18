import React from 'react';
import { DIRECTION } from '../../modules/IDE/actions/sorting';
import { render, fireEvent, screen } from '../../test-utils';
import TableHeaderCell from './TableHeaderCell';

describe('<TableHeaderCell>', () => {
  const onSort = jest.fn();

  const table = document.createElement('table');
  const tr = document.createElement('tr');
  table.appendChild(tr);
  document.body.appendChild(table);

  const subject = (sorting, defaultOrder = DIRECTION.ASC) =>
    render(
      <TableHeaderCell
        onSort={onSort}
        field="name"
        title="Name"
        defaultOrder={defaultOrder}
        sorting={sorting}
      />,
      { container: tr }
    );

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('indicates the active sort order', () => {
    it('shows an up arrow when active ascending', () => {
      subject({ field: 'name', direction: DIRECTION.ASC });
      expect(screen.getByRole('columnheader')).toHaveAttribute(
        'aria-sort',
        'ascending'
      );
      expect(screen.getByLabelText('Ascending')).toBeVisible();
      expect(screen.queryByLabelText('Descending')).not.toBeInTheDocument();
    });

    it('shows a down arrow when active descending', () => {
      subject({ field: 'name', direction: DIRECTION.DESC });
      expect(screen.getByRole('columnheader')).toHaveAttribute(
        'aria-sort',
        'descending'
      );
      expect(screen.queryByLabelText('Ascending')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Descending')).toBeVisible();
    });

    it('has no icon when inactive', () => {
      subject({ field: 'other', direction: DIRECTION.ASC });
      expect(screen.getByRole('columnheader')).not.toHaveAttribute('aria-sort');
      expect(screen.queryByLabelText('Ascending')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Descending')).not.toBeInTheDocument();
    });
  });

  describe('calls onSort when clicked', () => {
    const checkSort = (expectedDirection) => {
      fireEvent.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledWith({
        field: 'name',
        direction: expectedDirection
      });
    };

    it('uses defaultOrder when inactive, ascending', () => {
      subject({ field: 'other', direction: DIRECTION.ASC }, DIRECTION.ASC);
      checkSort(DIRECTION.ASC);
    });

    it('uses defaultOrder when inactive, descending', () => {
      subject({ field: 'other', direction: DIRECTION.ASC }, DIRECTION.DESC);
      checkSort(DIRECTION.DESC);
    });

    it('calls with DESC if currently sorted ASC', () => {
      subject({ field: 'name', direction: DIRECTION.ASC });
      checkSort(DIRECTION.DESC);
    });

    it('calls with ASC if currently sorted DESC', () => {
      subject({ field: 'name', direction: DIRECTION.DESC });
      checkSort(DIRECTION.ASC);
    });
  });
});
