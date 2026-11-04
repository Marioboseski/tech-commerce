import { useEffect, useState } from 'react';
import { getProducts } from '../services/productApi';
import type { ApiProduct } from '../types/product';

type LoadedProducts = {
  ids: number[];
  products: ApiProduct[];
};

// Loads the given products with one request (?ids=1,5,12). Used by the cart
// and favorites, which only store product ids in localStorage, so name,
// price and image always come fresh from the API.
export function useProductsByIds(productIds: number[]) {
  const [loaded, setLoaded] = useState<LoadedProducts>({
    ids: [],
    products: [],
  });

  const idsKey = [...productIds].sort((a, b) => a - b).join(',');
  const ids = idsKey ? idsKey.split(',').map(Number) : [];
  // Removing an id needs no new request; only an id that was not part of the
  // last request does.
  const loading = ids.some((id) => !loaded.ids.includes(id));

  useEffect(() => {
    if (!loading) {
      return;
    }

    let ignore = false;
    const requestedIds = idsKey.split(',').map(Number);

    const loadProducts = async () => {
      const data = await getProducts({ ids: requestedIds });
      if (!ignore) {
        setLoaded({ ids: requestedIds, products: data });
      }
    };
    loadProducts();

    return () => {
      ignore = true;
    };
  }, [loading, idsKey]);

  return { products: loaded.products, loading };
}
