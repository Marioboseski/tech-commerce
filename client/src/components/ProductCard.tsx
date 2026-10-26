import { Link } from "react-router-dom";
import type { ProductProps } from "../types/productTypes";

const ProductCard = ({product}: ProductProps) => {
  return (
    <Link to={`/products/${product.id}`} className="flex flex-col items-center border-2 border-gray-200 rounded-md p-2 cursor-pointer">
      <p>{product.name}</p>
      <p>{product.price}</p>
      <p>{product.category.name}</p>
    </Link>
  );
}

export default ProductCard;