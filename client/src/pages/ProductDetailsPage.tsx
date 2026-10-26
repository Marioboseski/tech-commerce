import { getProductById } from "../services/productsService";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ProductDetails } from "../types/productTypes";
import ProductSpecifications from "../components/ProductSpecifications";

const ProductDetailsPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProductDetails = async () => {
      setIsLoading(true);

      const data: ProductDetails | null = await getProductById(Number(id));
      setProduct(data);
      setIsLoading(false);
    }
    void loadProductDetails();
  }, [id]);

  if (isLoading) {
    return <p>Loading product details...</p>
  };

  if (!product) {
    return (
      <div>
        <p>Product details not found</p>
        <Link to={"/"}>Back to products</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to={"/"}>Back to products</Link>
      <p>{product.category.name}</p>
      <p>{product.name}</p>
      <p>${product.price.toFixed(2)}</p>
      <p>{product.description}</p>

      <ProductSpecifications key={product.id} product={product} />
    </div>
  );
}

export default ProductDetailsPage;