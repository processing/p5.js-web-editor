import React, { useRef } from 'react';
import { render } from '../test-utils';
import { useSyncFormTranslations } from './useSyncFormTranslations';

describe('useSyncFormTranslations', () => {
  it('resets and re-applies non-empty form values on language change', () => {
    const reset = jest.fn();
    const change = jest.fn();
    const getState = jest.fn().mockReturnValue({
      values: {
        name: 'Alice',
        email: 'alice@example.com',
        emptyField: ''
      }
    });

    const formMock = { getState, reset, change };

    function TestComponent({ language }: { language: string }) {
      const formRef = useRef<any>(formMock);
      useSyncFormTranslations(formRef, language);

      return null;
    }

    const { rerender } = render(<TestComponent language="en" />);
    rerender(<TestComponent language="fr" />); // simulate language change

    expect(reset).toHaveBeenCalled();

    expect(change).toHaveBeenCalledWith('name', 'Alice');
    expect(change).toHaveBeenCalledWith('email', 'alice@example.com');
    expect(change).not.toHaveBeenCalledWith('emptyField', '');
  });

  it('does nothing if formRef.current is null', () => {
    function TestComponent({ language }: { language: string }) {
      const formRef = useRef<any>(null);
      useSyncFormTranslations(formRef, language);
      return null;
    }

    render(<TestComponent language="en" />);
    // No error = pass
  });
});
