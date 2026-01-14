import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils';
import { FloatingActionButton } from './FloatingActionButton';
import { startSketch, stopSketch } from '../actions/ide';

jest.mock('../actions/ide', () => ({
  startSketch: jest.fn(() => ({ type: 'START_SKETCH' })),
  stopSketch: jest.fn(() => ({ type: 'STOP_SKETCH' }))
}));

describe('FloatingActionButton', () => {
  const defaultProps = {
    syncFileContent: jest.fn(),
    offsetBottom: 20
  };

  it('renders PlayIcon when not playing', () => {
    render(<FloatingActionButton {...defaultProps} />, {
      initialState: { ide: { isPlaying: false } }
    });
    // PlayIcon is rendered (SVG)
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls syncFileContent and startSketch when clicked and not playing', () => {
    render(<FloatingActionButton {...defaultProps} />, {
      initialState: { ide: { isPlaying: false } }
    });
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.syncFileContent).toHaveBeenCalled();
    expect(startSketch).toHaveBeenCalled();
  });

  it('calls stopSketch when clicked and playing', () => {
    render(<FloatingActionButton {...defaultProps} />, {
      initialState: { ide: { isPlaying: true } }
    });
    fireEvent.click(screen.getByRole('button'));
    expect(stopSketch).toHaveBeenCalled();
  });
});
