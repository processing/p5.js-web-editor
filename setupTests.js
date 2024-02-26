import { axe, toHaveNoViolations } from '@axe-core/react';
import ReactDOM from 'react-dom';
import App from './MyComponentAccessibility.test';

expect.extend(toHaveNoViolations);

beforeEach(async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  ReactDOM.render(<App />, container);

  // Runing accessibility checks
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  document.body.removeChild(container);
});
