import type { Carrier } from '../types/order';

export const CARRIERS = ['DHL', 'UPS', 'FEDEX', 'MK_POST', 'OTHER'] as const;

export const carrierLabels: Record<Carrier, string> = {
  DHL: 'DHL',
  UPS: 'UPS',
  FEDEX: 'FedEx',
  MK_POST: 'Macedonian Post',
  OTHER: 'Other',
};
