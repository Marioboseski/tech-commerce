import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getCategories } from '../services/categoryApi';
import type { ApiCategory } from '../types/category';
import { CategoriesContext } from './categories-context';

// Loads the categories once for the whole app (header, footer and pages).
export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
      setCategoriesLoaded(true);
    };
    loadCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, categoriesLoaded }}>
      {children}
    </CategoriesContext.Provider>
  );
}
