import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import Modal from './Modal';

describe('Modal', () => {
  it('can render title', () => {
    render(
      <Modal title="Foo" closeAriaLabel="Foo" onClose={jest.fn()}>
        Bar
      </Modal>
    );

    expect(screen.getByRole('heading', { name: 'Foo' })).toBeVisible();
  });

  it('can render child content', () => {
    render(
      <Modal title="Foo" closeAriaLabel="Foo" onClose={jest.fn()}>
        Bar
      </Modal>
    );

    expect(screen.getByText('Bar')).toBeVisible();
  });

  it('can call onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal title="Foo" closeAriaLabel="Foo" onClose={handleClose}>
        Bar
      </Modal>
    );

    const buttonEl = screen.getByRole('button');
    fireEvent.click(buttonEl);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('can call onClose when click event occurs in a parent node', () => {
    const handleClose = jest.fn();
    render(
      <div>
        <h1>Parent</h1>
        <Modal title="Foo" closeAriaLabel="Foo" onClose={handleClose}>
          Bar
        </Modal>
      </div>
    );

    const headingEl = screen.getByRole('heading', { name: 'Parent' });
    fireEvent.click(headingEl);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('can ignore click event for closing when it occurs inside component', () => {
    const handleClose = jest.fn();
    render(
      <Modal title="Foo" closeAriaLabel="Foo" onClose={handleClose}>
        Bar
      </Modal>
    );

    const headingEl = screen.getByRole('heading', { name: 'Foo' });
    fireEvent.click(headingEl);

    expect(handleClose).not.toHaveBeenCalled();
  });
});
