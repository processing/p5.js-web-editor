import React from 'react';
import { reduxRender } from '../../../../test-utils';

import Nav from './Nav';

jest.mock('../../../../utils/generateRandomName');

describe('Nav', () => {
  it('renders editor version for desktop', () => {
    const { asFragment } = reduxRender(<Nav />, { mobile: false });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders editor version for mobile', () => {
    const { asFragment } = reduxRender(<Nav />, { mobile: true });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders dashboard version for desktop', () => {
    const { asFragment } = reduxRender(<Nav layout="dashboard" />, {
      mobile: false
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders dashboard version for mobile', () => {
    const { asFragment } = reduxRender(<Nav layout="dashboard" />, {
      mobile: true
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
