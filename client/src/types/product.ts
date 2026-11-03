export type ApiProduct = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
    slug: string;
  };
};

export type LaptopDetails = {
  screenSize: string;
  ram: string;
  processor: string;
  storage: string;
  graphicsCard: string;
};

export type MobilePhoneDetails = {
  screenSize: string;
  ram: string;
  storage: string;
  processor: string;
  battery: string;
  camera: string;
};

export type ComputerDetails = {
  processor: string;
  ram: string;
  storage: string;
  graphicsCard: string;
  formFactor: string;
};

export type ConsoleDetails = {
  manufacturer: string;
  storage: string;
  resolution: string;
  maxPlayers: string;
  connectivity: string;
};

export type TabletDetails = {
  screenSize: string;
  ram: string;
  storage: string;
  processor: string;
  battery: string;
};

// Shape returned by GET /api/products/:id — only the details object that
// matches the product's category is filled, the others are null.
export type ApiProductDetails = ApiProduct & {
  laptopDetails: LaptopDetails | null;
  mobilePhoneDetails: MobilePhoneDetails | null;
  computerDetails: ComputerDetails | null;
  consoleDetails: ConsoleDetails | null;
  tabletDetails: TabletDetails | null;
};
