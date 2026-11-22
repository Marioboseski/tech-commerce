import { describe, expect, it } from 'vitest';
import type { CartItem } from '../types/cart';
import { FREE_SHIPPING_FROM, getCartQuantity, getCartTotals } from './cart';

const item = (price: number, quantity: number): CartItem => ({
  productId: price,
  quantity,
  product: {
    id: price,
    sku: `TEST-${price}`,
    name: `Product ${price}`,
    description: '',
    price,
    imageUrl: null,
    categoryId: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    category: { name: 'Laptops', slug: 'laptops' },
  },
});

describe('getCartQuantity', () => {
  it('counts every piece, not only the products', () => {
    expect(getCartQuantity([item(10, 2), item(20, 3)])).toBe(5);
  });

  it('is 0 for an empty cart', () => {
    expect(getCartQuantity([])).toBe(0);
  });
});

// Must match the server (ordersService): free shipping from 75 €, else 9.90 €.
describe('getCartTotals', () => {
  it('adds 9.90 € shipping under the free shipping limit', () => {
    expect(getCartTotals([item(30, 2)])).toEqual({
      subtotal: 60,
      shipping: 9.9,
      total: 69.9,
    });
  });

  it(`ships for free from ${FREE_SHIPPING_FROM} €`, () => {
    expect(getCartTotals([item(FREE_SHIPPING_FROM, 1)])).toEqual({
      subtotal: 75,
      shipping: 0,
      total: 75,
    });
  });

  it('charges no shipping for an empty cart', () => {
    expect(getCartTotals([])).toEqual({ subtotal: 0, shipping: 0, total: 0 });
  });
});
