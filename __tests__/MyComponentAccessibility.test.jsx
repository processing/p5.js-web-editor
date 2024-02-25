import React from 'react';
import ReactDOM from 'react-dom';
import { axe, toHaveNoViolations } from '@axe-core/react';

// Adding the toHaveNoViolations matcher
expect.extend(toHaveNoViolations);

// Test component
const App = () => (
  <div>
    <h1>Hello, world!</h1>
    <p>This is a sample component.</p>
  </div>
);

// Mounting the component and running accessibility checks
ReactDOM.render(<App />, document.getElementById('root'), async () => {
  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});
