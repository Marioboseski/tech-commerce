import type { InputHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  // What register('email') returns: name, onChange, onBlur and ref.
  registration: UseFormRegisterReturn;
  error?: FieldError;
};

// One label + input + the error message under it. Used by all forms, so
// every field looks and behaves the same (also for screen readers).
export default function FormField({
  label,
  registration,
  error,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${registration.name}-error`;

  return (
    <label>
      {label}
      <input
        {...inputProps}
        {...registration}
        // Screen readers say "invalid" and read the message below.
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error?.message && (
        <span className="field-error" id={errorId}>
          {error.message}
        </span>
      )}
    </label>
  );
}
