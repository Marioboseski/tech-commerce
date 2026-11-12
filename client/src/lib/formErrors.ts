import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './apiClient';

// Shows the server's field errors under the matching inputs.
// Returns true when at least one field got a message, so the form does not
// also need the general error box.
export const showServerFieldErrors = <Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  fields: readonly Path<Values>[],
): boolean => {
  if (!(error instanceof ApiError)) {
    return false;
  }

  let shown = false;
  for (const { field, message } of error.errors) {
    // Only fields this form really has (the server could name others).
    const formField = fields.find((name) => name === field);
    if (formField) {
      setError(formField, { type: 'server', message });
      shown = true;
    }
  }
  return shown;
};
