export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// What the checkout form sends. No products or prices: the server takes
// them from the user's cart.
export type DeliveryAddress = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
};

// Name and price are copies from the moment of ordering.
// productId and imageUrl are null if the product was deleted since then.
export type OrderItem = {
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

export type Order = DeliveryAddress & {
  id: number;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};
