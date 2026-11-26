import { z } from 'zod';
import { CARRIERS } from '../lib/carriers';

// Same rules and messages as the server (server/src/schemas/adminOrderSchemas.ts).
export const shipmentSchema = z.object({
  carrier: z.enum(CARRIERS, 'Choose a carrier'),
  trackingNumber: z
    .string()
    .trim()
    .min(1, 'Enter a tracking number')
    .max(100, 'Tracking number can be at most 100 characters'),
});

export type Shipment = z.output<typeof shipmentSchema>;
