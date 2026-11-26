export type OrderStatus =
  'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type Carrier = 'DHL' | 'UPS' | 'FEDEX' | 'MK_POST' | 'OTHER';

export type OrderStatusEvent = {
  status: OrderStatus;
  createdAt: string;
};

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
  // Set once the order is shipped.
  carrier: Carrier | null;
  trackingNumber: string | null;
  createdAt: string;
  statusHistory: OrderStatusEvent[];
  items: OrderItem[];
};
