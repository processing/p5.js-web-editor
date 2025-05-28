import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Menubar from './Menubar';
import MenubarSubmenu from './MenubarSubmenu';
import MenubarItem from './MenubarItem';

describe('Menubar', () => {
  const renderMenubar = () => {
    render(
      <Menubar>
        <MenubarSubmenu id="file" title="File">
          <MenubarItem id="file-new" title="New" onClick={jest.fn()}>
            New
          </MenubarItem>
          <MenubarItem id="file-save" title="Save" onClick={jest.fn()}>
            Save
          </MenubarItem>
          <MenubarItem id="file-open" title="Open" onClick={jest.fn()}>
            Open
          </MenubarItem>
        </MenubarSubmenu>
        <MenubarSubmenu id="edit" title="Edit">
          <MenubarItem id="edit-tidy" title="Tidy" onClick={jest.fn()}>
            Tidy
          </MenubarItem>
          <MenubarItem id="edit-find" title="Find" onClick={jest.fn()}>
            Find
          </MenubarItem>
          <MenubarItem id="edit-replace" title="Replace" onClick={jest.fn()}>
            Replace
          </MenubarItem>
        </MenubarSubmenu>
      </Menubar>
    );
  };

  it('should render a menubar with submenu triggers', () => {
    renderMenubar();

    const fileMenuTrigger = screen.getByRole('menuitem', { name: 'File' });
    const editMenuTrigger = screen.getByRole('menuitem', { name: 'Edit' });

    expect(fileMenuTrigger).toBeInTheDocument();
    expect(editMenuTrigger).toBeInTheDocument();
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open a submenu when clicked', () => {
    renderMenubar();

    const fileMenuTrigger = screen.getByRole('menuitem', { name: 'File' });
    const editMenuTrigger = screen.getByRole('menuitem', { name: 'Edit' });

    fireEvent.click(fileMenuTrigger);
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(editMenuTrigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(document.body);
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should support top-level keyboard navigation', () => {
    renderMenubar();

    const fileMenuTrigger = screen.getByRole('menuitem', { name: 'File' });
    const editMenuTrigger = screen.getByRole('menuitem', { name: 'Edit' });
    fireEvent.focus(fileMenuTrigger);

    fireEvent.keyDown(fileMenuTrigger, { key: 'ArrowRight' });
    expect(editMenuTrigger).toHaveFocus();

    fireEvent.keyDown(editMenuTrigger, { key: 'ArrowLeft' });
    expect(fileMenuTrigger).toHaveFocus();

    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });

    fireEvent.keyDown(fileMenuTrigger, { key: 'ArrowDown' });
    expect(newMenuItem).toHaveFocus();

    fireEvent.keyDown(newMenuItem, { key: 'Escape' });
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should support submenu keyboard navigation', () => {
    renderMenubar();

    const fileMenuTrigger = screen.getByRole('menuitem', { name: 'File' });
    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });
    const openMenuItem = screen.getByRole('menuitem', { name: 'Open' });

    const editMenuTrigger = screen.getByRole('menuitem', { name: 'Edit' });

    fireEvent.click(fileMenuTrigger);
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(fileMenuTrigger, { key: 'ArrowDown' });
    expect(newMenuItem).toHaveFocus();

    fireEvent.keyDown(newMenuItem, { key: 'ArrowUp' });
    expect(newMenuItem).not.toHaveFocus();
    expect(openMenuItem).toHaveFocus();

    fireEvent.keyDown(openMenuItem, { key: 'ArrowRight' });
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(openMenuItem).not.toHaveFocus();
    expect(editMenuTrigger).toHaveFocus();
    expect(editMenuTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(editMenuTrigger, { key: 'ArrowLeft' });
    expect(editMenuTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(editMenuTrigger).not.toHaveFocus();
    expect(fileMenuTrigger).toHaveFocus();
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(newMenuItem, { key: 'Escape' });
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should activate a menu item when clicked', () => {
    const handleClick = jest.fn();

    render(
      <Menubar>
        <MenubarSubmenu id="file" title="File">
          <MenubarItem id="file-new" title="New" onClick={handleClick}>
            New
          </MenubarItem>
        </MenubarSubmenu>
      </Menubar>
    );

    const fileMenuTrigger = screen.getByRole('menuitem', { name: 'File' });
    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });
    fireEvent.click(fileMenuTrigger);
    fireEvent.mouseUp(newMenuItem);
    fireEvent.click(newMenuItem);

    expect(handleClick).toHaveBeenCalled();
    expect(fileMenuTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have proper ARIA attributes', () => {
    renderMenubar();

    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    expect(fileMenu).toHaveAttribute('aria-haspopup', 'menu');
    expect(fileMenu).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(fileMenu);
    expect(fileMenu).toHaveAttribute('aria-expanded', 'true');
  });
});
