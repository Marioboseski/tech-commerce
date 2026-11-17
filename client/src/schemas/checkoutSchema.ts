import { z } from 'zod';

// Same rules and messages as the server (server/src/schemas/ordersSchemas.ts).
const requiredText = (name: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${name} is required`)
    .max(maxLength, `${name} can be at most ${maxLength} characters`);

export const deliveryAddressSchema = z.object({
  fullName: requiredText('Full name', 100),
  street: requiredText('Street', 255),
  city: requiredText('City', 100),
  postalCode: requiredText('Postal code', 20),
});
