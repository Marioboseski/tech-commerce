import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type FavoritesContextValue = {
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

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
    window.localStorage.setItem('techstore-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }

  return context;
}
