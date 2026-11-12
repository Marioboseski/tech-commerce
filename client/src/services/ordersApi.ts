import { ApiError, apiRequest } from '../lib/apiClient';
import type { DeliveryAddress, Order } from '../types/order';

// Turns the cart into an order. Only the address is sent: the server takes
// the products and prices from the user's cart.
export const createOrder = (address: DeliveryAddress) =>
  apiRequest<Order>('/api/orders', { method: 'POST', body: address });

// The logged-in user's orders, newest first.
export const getOrders = () => apiRequest<Order[]>('/api/orders');

// One of the user's orders. Resolves to null when it does not exist
// (or belongs to someone else: the server answers 404 for both).
export const getOrder = async (orderId: number): Promise<Order | null> => {
  try {
    return await apiRequest<Order>(`/api/orders/${orderId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};
