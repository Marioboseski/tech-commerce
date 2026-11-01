import { useEffect, useRef, useState } from 'react';

type ProfileMenuProps = {
  /** Reserved for the real authentication session when it is introduced. */
  isAuthenticated?: boolean;
};

export default function ProfileMenu({
  isAuthenticated = false,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
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

  const items = isAuthenticated
    ? ['Profile', 'My Orders', 'Logout']
    : ['Login', 'Register'];

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-toggle"
        type="button"
        ref={toggleRef}
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="profile-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66" />
        </svg>
      </button>
      {open && (
        <div className="profile-dropdown" role="menu" aria-label="User menu">
          {items.map((item) => (
            <button key={item} type="button" role="menuitem">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
