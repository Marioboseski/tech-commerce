import { useContext } from 'react';
import { FavoritesContext } from '../context/favorites-context';

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
