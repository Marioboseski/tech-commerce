import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import { useCurrentUser, useLogout } from '../../hooks/useCurrentUser';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { user } = useCurrentUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const items = user
    ? [
        { label: 'Profile', to: '/profile' },
        { label: 'My Orders', to: '/orders' },
      ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className={`profile-toggle ${user ? 'is-signed-in' : ''}`}
        type="button"
        ref={toggleRef}
        aria-label={
          user ? `Open account menu for ${user.fullName}` : 'Open user menu'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {user ? (
          <span className="profile-initials">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <CircleUserRound className="profile-icon" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="profile-dropdown" role="menu" aria-label="User menu">
          {user && (
            <p className="profile-greeting">
              Signed in as <strong>{user.fullName}</strong>
            </p>
          )}
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <button
              className="profile-logout"
              type="button"
              role="menuitem"
              disabled={logoutMutation.isPending}
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    setOpen(false);
                    navigate('/');
                  },
                });
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}
