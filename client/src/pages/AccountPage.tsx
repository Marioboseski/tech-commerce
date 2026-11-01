import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useAuth } from '../hooks/useAuth';

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

export default function AccountPage() {
  const { pathname } = useLocation();
  const mode = pathname === '/register' ? 'register' : 'login';
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const content = copy[mode === 'register' ? 'register' : 'login'];

  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <form
          className="account-card"
          onSubmit={(event) => {
            event.preventDefault();
            const result =
              mode === 'register'
                ? register(name, email, password)
                : login(email, password);
            if (result.ok) {
              navigate('/');
            } else {
              setMessage(result.message ?? 'Something went wrong.');
            }
          }}
        >
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="section-title">{content.title}</h1>
          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={6}
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">
            {content.action}
          </button>
          {message && (
            <p className="account-error" role="alert">
              {message}
            </p>
          )}
          <p className="account-note">
            Demo account data is stored only in this browser until the backend
            is connected.
          </p>
          <p className="account-switch">
            {content.prompt} <Link to={content.to}>{content.link}</Link>
          </p>
        </form>
      </main>
      <StoreFooter />
    </div>
  );
}
