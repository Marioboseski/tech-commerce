import { useEffect, useState } from 'react';
import type { CartState } from '../context/cart-context';
import { getProducts } from '../services/productApi';
import type { ApiProduct } from '../types/product';

type LoadedCartProducts = {
  ids: number[];
  products: ApiProduct[];
};

// Loads the products that are in the cart with one request (?ids=1,5,12).
// The cart itself only stores id → quantity, so name, price and image
// always come fresh from the API.
export function useCartProducts(cart: CartState) {
  const [loaded, setLoaded] = useState<LoadedCartProducts>({
    ids: [],
    products: [],
  });

  const idsKey = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b)
    .join(',');
  const ids = idsKey ? idsKey.split(',').map(Number) : [];
  // Changing a quantity or removing a product needs no new request; only a
  // product that was not part of the last request does.
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
