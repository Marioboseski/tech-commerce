import { Link, useParams } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';

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
  const { mode = 'login' } = useParams();
  const content = copy[mode === 'register' ? 'register' : 'login'];

  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <form
          className="account-card"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="section-title">{content.title}</h1>
          {mode === 'register' && (
            <label>
              Full name
              <input required autoComplete="name" />
            </label>
          )}
          <label>
            Email address
            <input required type="email" autoComplete="email" />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
            />
          </label>
          <button className="primary-button" type="submit">
            {content.action}
          </button>
          <p className="account-note">
            Authentication will be connected once the backend is available.
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
