import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useAuth } from '../hooks/useAuth';
import { registerUser } from '../services/authApi';
import type { RegisterInput } from '../types/auth';

const copy = {
  login: {
    eyebrow: 'WELCOME BACK',
    title: 'Sign in to TechStore',
    action: 'Sign in',
    prompt: 'New to TechStore?',
    link: 'Create an account',
    to: '/register',
  },
  register: {
    eyebrow: 'CREATE ACCOUNT',
    title: 'Join TechStore',
    action: 'Create account',
    prompt: 'Already have an account?',
    link: 'Sign in',
    to: '/login',
  },
} as const;

// Same limits as the server (authController.ts).
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_FULL_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

export default function AccountPage() {
  const { pathname, state } = useLocation();
  const mode = pathname === '/register' ? 'register' : 'login';
  const navigate = useNavigate();
  // Login still uses the demo AuthProvider until POST /api/auth/login exists.
  const { login } = useAuth();
  const [formData, setFormData] = useState<RegisterInput>({
    fullName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const content = copy[mode];
  // Set by navigate('/login', { state: { registered: true } }) after sign up.
  const justRegistered =
    (state as { registered?: boolean } | null)?.registered === true;

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Keep the email so the user does not have to type it again on login.
      setFormData((prev) => ({ ...prev, fullName: '', password: '' }));
      navigate('/login', { state: { registered: true } });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const errorMessage =
    mode === 'register' ? registerMutation.error?.message : message;

  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <form
          className="account-card"
          onSubmit={(event) => {
            event.preventDefault();
            if (mode === 'register') {
              registerMutation.mutate(formData);
              return;
            }
            const result = login(formData.email, formData.password);
            if (result.ok) {
              navigate('/');
            } else {
              setMessage(result.message ?? 'Something went wrong.');
            }
          }}
        >
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="section-title">{content.title}</h1>
          {mode === 'login' && justRegistered && (
            <p className="account-success" role="status">
              Account created, please sign in.
            </p>
          )}
          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                name="fullName"
                autoComplete="name"
                maxLength={MAX_FULL_NAME_LENGTH}
                value={formData.fullName}
                onChange={handleChange}
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Password
            <input
              required
              name="password"
              // Length rules only matter when choosing a new password.
              minLength={mode === 'register' ? MIN_PASSWORD_LENGTH : undefined}
              maxLength={MAX_PASSWORD_LENGTH}
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              value={formData.password}
              onChange={handleChange}
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating account…' : content.action}
          </button>
          {errorMessage && (
            <p className="account-error" role="alert">
              {errorMessage}
            </p>
          )}
          {mode === 'login' && (
            <p className="account-note">
              Demo account data is stored only in this browser until the backend
              is connected.
            </p>
          )}
          <p className="account-switch">
            {content.prompt} <Link to={content.to}>{content.link}</Link>
          </p>
        </form>
      </main>
      <StoreFooter />
    </div>
  );
}
