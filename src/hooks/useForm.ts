import { useState, useCallback } from 'react';

interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  });

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...values
      }
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      }
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {}
    }));
  }, []);

  const reset = useCallback((newValues?: T) => {
    setState({
      data: newValues || initialValues,
      errors: {},
      touched: {},
      isSubmitting: false
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      // Validate if validation function is provided
      if (validate) {
        const validationErrors = validate(state.data);
        if (Object.keys(validationErrors).length > 0) {
          setState(prev => ({
            ...prev,
            errors: validationErrors,
            isSubmitting: false
          }));
          return;
        }
      }

      await onSubmit(state.data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.data, validate, onSubmit]);

  return {
    values: state.data,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    setValue,
    setValues,
    setError,
    clearErrors,
    reset,
    handleSubmit
  };
}

export default useForm;
