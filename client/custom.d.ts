declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  // eslint-disable-next-line import/no-default-export
  export default ReactComponent;
}

// Extend window for Redux DevTools
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => any;
}

// Extend NodeModule for hot reloading
interface NodeModule {
  hot?: {
    accept(path?: string, callback?: () => void): void;
  };
}
