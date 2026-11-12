import { Link, Navigate, useLocation } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import LoginForm from '../components/account/LoginForm';
import RegisterForm from '../components/account/RegisterForm';
import { useCurrentUser } from '../hooks/useCurrentUser';

const copy = {
  login: {
    eyebrow: 'WELCOME BACK',
    title: 'Sign in to TechStore',
    prompt: 'New to TechStore?',
    link: 'Create an account',
    to: '/register',
  },
  register: {
    eyebrow: 'CREATE ACCOUNT',
    title: 'Join TechStore',
    prompt: 'Already have an account?',
    link: 'Sign in',
    to: '/login',
  },
} as const;

// Sent by RegisterForm: navigate('/login', { state: { registered, email } }).
type AccountPageState = { registered?: boolean; email?: string } | null;

export default function AccountPage() {
  const { pathname, state } = useLocation();
  const mode = pathname === '/register' ? 'register' : 'login';
  const { user } = useCurrentUser();
  const content = copy[mode];
  const { registered, email } = (state as AccountPageState) ?? {};

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <section className="account-card">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="section-title">{content.title}</h1>
          {mode === 'login' && registered && (
            <p className="account-success" role="status">
              Account created, please sign in.
            </p>
          )}
          {mode === 'register' ? (
            <RegisterForm />
          ) : (
            <LoginForm defaultEmail={email} />
          )}
          <p className="account-switch">
            {content.prompt} <Link to={content.to}>{content.link}</Link>
          </p>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
