import { useEffect, MutableRefObject } from 'react';

export interface FormLike {
  getState(): { values: Record<string, unknown> };
  reset(): void;
  change(field: string, value: unknown): void;
}

/**
 * This hook ensures that form values are preserved when the language changes.
 * @param formRef
 * @param language
 */
export const useSyncFormTranslations = (
  formRef: MutableRefObject<FormLike>,
  language: string
) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const { values } = form.getState();
    form.reset();

    Object.keys(values).forEach((field) => {
      if (values[field]) {
        form.change(field, values[field]);
      }
    });
  }, [language]);
};
