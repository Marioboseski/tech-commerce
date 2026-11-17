import type { InputHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
};

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
