import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormField from '../forms/FormField';
import { useLogin } from '../../hooks/useCurrentUser';
import { showServerFieldErrors } from '../../lib/formErrors';
import { loginSchema } from '../../schemas/authSchemas';

type LoginFormProps = {
  // Filled in after sign up, so the user does not type the email again.
  defaultEmail?: string;
};

export default function LoginForm({ defaultEmail = '' }: LoginFormProps) {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    // Zod checks the form before onSubmit runs.
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: '' },
    // Show a field's error once the user leaves it, then live while typing.
    mode: 'onTouched',
  });

  // Runs only when the form is valid; values are already trimmed by Zod.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigate('/');
    } catch (error) {
      // Field errors from the server go under the inputs; anything else
      // (e.g. "Email or password is incorrect") in the box below the button.
      if (!showServerFieldErrors(error, setError, ['email', 'password'])) {
        setError('root.server', {
          message:
            error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }
  });

  return (
    // noValidate: Zod shows our messages instead of the browser's bubbles.
    <form className="account-auth-form" onSubmit={onSubmit} noValidate>
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
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
      />
      <button
        className="primary-button"
        type="submit"
        disabled={login.isPending}
      >
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>
      {errors.root?.server && (
        <p className="account-error" role="alert">
          {errors.root.server.message}
        </p>
      )}
    </form>
  );
}
