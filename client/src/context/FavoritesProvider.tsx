import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FavoritesContext } from './favorites-context';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const savedFavorites = window.localStorage.getItem('techstore-favorites');
      return new Set<number>(savedFavorites ? JSON.parse(savedFavorites) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      'techstore-favorites',
      JSON.stringify([...favorites]),
    );
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
