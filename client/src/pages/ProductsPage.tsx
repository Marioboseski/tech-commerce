import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productsService";
import type { Product } from "../types/productTypes";

const ProductsPage = () => {

  const [ products, setProducts ] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    }
    loadProducts();
  },[]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductsPage;