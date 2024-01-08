import React from 'react';

import { render, screen } from '../../../test-utils';

import EditorAccessibility from './EditorAccessibility';

describe('<EditorAccessibility />', () => {
  it('renders empty message with no lines', () => {
    render(<EditorAccessibility lintMessages={[]} />);

    expect(
      screen.getByRole('listitem', {
        description: 'There are no lint messages'
      })
    ).toBeInTheDocument();
  });

  it('renders lint message', () => {
    render(
      <EditorAccessibility
        lintMessages={[
          {
            severity: 'info',
            line: '1',
            message: 'foo',
            id: '1a2b3c'
          }
        ]}
      />
    );

    expect(
      screen.queryByText('There are no lint messages')
    ).not.toBeInTheDocument();

    const listItem = screen.getByRole('listitem');
    expect(listItem).toBeInTheDocument();
    expect(listItem.textContent).toEqual('info in line1 :foo');
  });
});
