import { getProductById } from "../services/productsService";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ProductDetails } from "../types/productTypes";
import ProductSpecifications from "../components/product/ProductSpecifications";

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
    <div className="flex flex-col justify-center text-center p-3">
      <Link to={"/"} className="flex justify-start border border-blue-300 max-w-35">Back to products</Link>
      <div className="flex flex-col gap-2 p-2 border-b-2 border-gray-300">
        <p>Product: {product.name}</p>
        <p>Price${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <p>{product.category.name}</p>
      </div>

      <ProductSpecifications key={product.id} product={product} />
    </div>
  );
}

export default ProductDetailsPage;
