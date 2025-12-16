import { useEffect, MutableRefObject } from 'react';
import type { FormApi } from 'final-form';

// Generic FormLike that mirrors FormApi for any form value type
export interface FormLike<FormValues = Record<string, unknown>>
  extends Pick<FormApi<FormValues>, 'getState' | 'reset' | 'change'> {}

/**
 * This hook ensures that form values are preserved when the language changes.
 * @param formRef
 * @param language
 */
export const useSyncFormTranslations = <FormValues extends Record<string, any>>(
  formRef: MutableRefObject<FormLike<FormValues> | null>,
  language: string
) => {
  useEffect(() => {
    const form = formRef?.current;
    if (!form) return;

    const { values } = form.getState();
    form.reset();

    (Object.keys(values) as (keyof FormValues)[]).forEach((field) => {
      const value = values[field];
      if (value !== undefined && value !== null && value !== '') {
        form.change(field, value);
      }
    });
  }, [language]);
};
