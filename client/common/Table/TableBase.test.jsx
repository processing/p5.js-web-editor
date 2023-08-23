import React from 'react';
import { DIRECTION } from '../../modules/IDE/actions/sorting';
import { render, screen } from '../../test-utils';
import TableBase from './TableBase';

describe('<TableBase/>', () => {
  const items = [
    { id: '1', name: 'abc', count: 3 },
    { id: '2', name: 'def', count: 10 }
  ];

  const props = {
    items,
    initialSort: { field: 'count', direction: DIRECTION.DESC },
    emptyMessage: 'No items found',
    renderRow: (item) => <tr key={item.id} />,
    columns: []
  };

  const subject = (overrideProps) =>
    render(<TableBase {...props} {...overrideProps} />);

  jest.spyOn(props, 'renderRow');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a spinner when loading', () => {
    subject({ isLoading: true });

    expect(document.querySelector('.loader')).toBeInTheDocument();
  });

  it('show the `emptyMessage` when there are no items', () => {
    subject({ items: [] });

    expect(screen.getByText(props.emptyMessage)).toBeVisible();
  });

  it('calls `renderRow` function for each row', () => {
    subject();

    expect(props.renderRow).toHaveBeenCalledTimes(2);
  });

  it('sorts the items', () => {
    subject();

    expect(props.renderRow).toHaveBeenNthCalledWith(1, items[1]);
    expect(props.renderRow).toHaveBeenNthCalledWith(2, items[0]);
  });

  it('does not add an extra header if `addDropdownColumn` is false', () => {
    subject({ addDropdownColumn: false });
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
  });

  it('adds an extra header if `addDropdownColumn` is true', () => {
    subject({ addDropdownColumn: true });
    expect(screen.getByRole('columnheader')).toBeInTheDocument();
  });
});
