import { createContext } from 'react';

export type FavoritesContextValue = {
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);
