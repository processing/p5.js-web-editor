import EditorAccessibility from './EditorAccessibility';

export default {
  title: 'IDE/EditorAccessibility',
  component: EditorAccessibility
};

export const Default = {
  args: {
    lintMessages: [
      {
        severity: 'warn',
        line: '10',
        message: 'Warning Foo',
        id: '123'
      }
    ]
  }
};
