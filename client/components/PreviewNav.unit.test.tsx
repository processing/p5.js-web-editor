import React from 'react';
import { render, screen } from '../test-utils';
import { PreviewNav } from './PreviewNav';

describe('PreviewNav', () => {
  const owner = { username: 'alice' };
  const project = { id: '123', name: 'My Project' };

  test('renders with correct links and icons using provided data-testid attributes', () => {
    render(<PreviewNav owner={owner} project={project} />);

    // Logo link to /alice/sketches
    const iconLinkUserSketches = screen.getByTestId('icon-link_user-sketches');
    expect(iconLinkUserSketches).toHaveAttribute(
      'href',
      `/${owner.username}/sketches`
    );

    // p5js logo icon presence
    const iconP5Logo = screen.getByTestId('icon_p5-logo');
    expect(iconP5Logo).toBeInTheDocument();

    // Current project link to /alice/sketches/123
    const linkCurrentProject = screen.getByTestId('link_current-project');
    expect(linkCurrentProject).toHaveAttribute(
      'href',
      `/${owner.username}/sketches/${project.id}`
    );
    expect(linkCurrentProject).toHaveTextContent(project.name);

    // Owner username link to /alice/sketches
    const linkUserSketches = screen.getByTestId('link_user-sketches');
    expect(linkUserSketches).toHaveAttribute(
      'href',
      `/${owner.username}/sketches`
    );
    expect(linkUserSketches).toHaveTextContent(owner.username);

    // Edit project code link to /alice/sketches/123
    const linkProjectCode = screen.getByTestId('link_project-code');
    expect(linkProjectCode).toHaveAttribute(
      'href',
      `/${owner.username}/sketches/${project.id}`
    );

    // Code icon presence
    const iconCode = screen.getByTestId('icon_code');
    expect(iconCode).toBeInTheDocument();

    // Check nav container presence
    const nav = screen.getByTestId('preview-nav');
    expect(nav).toBeInTheDocument();
  });
});
