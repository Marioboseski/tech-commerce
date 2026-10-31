const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = async () => {
  const res = await fetch(`${API_URL}/api/products`);
  return res.json();
};

export const getProductById = async (id: number) => {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  return res.json();
};
