import { describe, expect, it } from 'vitest';
import { deliveryAddressSchema } from './checkoutSchema';

const valid = {
  fullName: 'Marko Petrov',
  street: 'Test Street 1',
  city: 'Skopje',
  postalCode: '1000',
};

describe('deliveryAddressSchema', () => {
  it('trims every field', () => {
    const result = deliveryAddressSchema.parse({
      ...valid,
      city: '  Skopje  ',
    });

    expect(result.city).toBe('Skopje');
  });

  it.each([
    ['fullName', 'Full name is required'],
    ['street', 'Street is required'],
    ['city', 'City is required'],
    ['postalCode', 'Postal code is required'],
  ])('requires %s', (field, message) => {
    const result = deliveryAddressSchema.safeParse({ ...valid, [field]: ' ' });

    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it('limits the postal code to 20 characters, like the database column', () => {
    const result = deliveryAddressSchema.safeParse({
      ...valid,
      postalCode: '1'.repeat(21),
    });

    expect(result.error?.issues[0]?.message).toBe(
      'Postal code can be at most 20 characters',
    );
  });
});
