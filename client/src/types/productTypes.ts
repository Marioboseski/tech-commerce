export type Product = {
  id: number,
  sku: string,
  name: string,
  description: string,
  price: number,
  imageUrl: string | null,
  category: {
    name: string,
    slug: string,
  }
};

export type ProductProps = {
  product: Product
};

export type LaptopDetails = {
  screenSize: string,
  ram: string,
  processor: string,
  storage: string,
  graphicsCard: string,
}

export type MobilePhoneDetails = {
  screenSize: string,
  ram: string,
  storage: string,
  processor: string,
  battery: string,
  camera: string,
}

export type ComputerDetails = {
  processor: string,
  ram: string,
  storage: string,
  graphicsCard: string,
  formFactor: string,
}

export type ConsoleDetails = {
  manufacturer: string,
  storage: string,
  resolution: string,
  maxPlayers: string,
  connectivity: string,
}

export type TabletDetails = {
  screenSize: string,
  ram: string,
  storage: string,
  processor: string,
  battery: string,
}


export type ProductDetails = Omit<Product, "category"> & {
  category: {
    name: string;
  };
  laptopDetails: LaptopDetails | null;
  mobilePhoneDetails: MobilePhoneDetails | null;
  computerDetails: ComputerDetails | null;
  consoleDetails: ConsoleDetails | null;
  tabletDetails: TabletDetails | null;
};


