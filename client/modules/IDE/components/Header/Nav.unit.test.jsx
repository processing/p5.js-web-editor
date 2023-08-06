import React from 'react';
import { reduxRender } from '../../../../test-utils';

import Nav from './Nav';

// jest.mock('../i18n');

describe('Nav', () => {
  it('renders editor version', () => {
    const { asFragment } = reduxRender(<Nav />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders dashboard version', () => {
    const { asFragment } = reduxRender(<Nav layout="dashboard" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
