import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FormField from '../forms/FormField';
import { registerUser } from '../../services/authApi';
import { showServerFieldErrors } from '../../lib/formErrors';
import { registerSchema } from '../../schemas/authSchemas';

export default function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useMutation({
    mutationFn: registerUser,
    // The form shows the error itself, so no toast.
    meta: { inlineError: true },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await registerMutation.mutateAsync(values);
      // The login form shows "Account created" and has the email filled in.
      navigate('/login', { state: { registered: true, email: user.email } });
    } catch (error) {
      if (
        !showServerFieldErrors(error, setError, [
          'fullName',
          'email',
          'password',
        ])
      ) {
        // e.g. "An account with this email already exists"
        setError('root.server', {
          message:
            error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }
  });

  return (
    <form className="account-auth-form" onSubmit={onSubmit} noValidate>
      <FormField
        label="Full name"
        autoComplete="name"
        registration={register('fullName')}
        error={errors.fullName}
      />
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        registration={register('password')}
        error={errors.password}
      />
      <button
        className="primary-button"
        type="submit"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Creating account…' : 'Create account'}
      </button>
      {errors.root?.server && (
        <p className="account-error" role="alert">
          {errors.root.server.message}
        </p>
      )}
    </form>
  );
}
