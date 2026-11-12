import type { DeliveryAddress, Order } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL;

// All orders routes need the login cookie (credentials: 'include').
// fetch does not throw on 400/401/404/409/500, so we throw with the
// server's message, e.g. "Your cart is empty".
const ordersRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const res = await fetch(`${API_URL}/api/orders${path}`, {
    ...init,
    credentials: 'include',
  });

  if (!res.ok) {
    // The body may not be JSON (e.g. an HTML 500 page), so parsing can fail.
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Orders request failed: ${res.status}`);
  }

  return res;
};

// Turns the cart into an order. Only the address is sent.
export const createOrder = async (address: DeliveryAddress): Promise<Order> => {
  const res = await ordersRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  return res.json();
};

// The logged-in user's orders, newest first.
export const getOrders = async (): Promise<Order[]> => {
  const res = await ordersRequest('');
  return res.json();
};

// One of the user's orders. Resolves to null when it does not exist
// (or belongs to someone else: the server answers 404 for both).
export const getOrder = async (orderId: number): Promise<Order | null> => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    credentials: 'include',
  });

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to load order: ${res.status}`);
  }
  return res.json();
};
