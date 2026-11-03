import type { ApiProductDetails } from '../types/product';

const specLabels: Record<string, string> = {
  screenSize: 'Screen size',
  ram: 'RAM',
  processor: 'Processor',
  storage: 'Storage',
  graphicsCard: 'Graphics card',
  battery: 'Battery',
  camera: 'Camera',
  formFactor: 'Form factor',
  manufacturer: 'Manufacturer',
  resolution: 'Resolution',
  maxPlayers: 'Max players',
  connectivity: 'Connectivity',
};

// Turns the category-specific details object into label/value rows.
export const getProductSpecs = (product: ApiProductDetails) => {
  const details =
    product.laptopDetails ??
    product.mobilePhoneDetails ??
    product.computerDetails ??
    product.consoleDetails ??
    product.tabletDetails;

  if (!details) {
    return [];
  }

  return Object.entries(details).map(([key, value]) => ({
    label: specLabels[key] ?? key,
    value,
  }));
};
