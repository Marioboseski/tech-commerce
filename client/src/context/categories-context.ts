import { createContext } from 'react';
import type { ApiCategory } from '../types/category';

export type CategoriesContextValue = {
  categories: ApiCategory[];
  categoriesLoaded: boolean;
};

export const CategoriesContext = createContext<CategoriesContextValue | null>(
  null,
);
