// Every category stores its specs in its own table (laptop_details, ...).
// This map is the one place that says which table and which fields belong
// to which category slug. A new category needs a new table + migration
// first, so admins cannot create categories from the panel.
// The numbers are the column sizes in schema.prisma.
export const categorySpecs = {
  laptops: {
    relation: "laptopDetails",
    fields: { screenSize: 50, ram: 50, processor: 255, storage: 100, graphicsCard: 255 },
  },
  "mobile-phones": {
    relation: "mobilePhoneDetails",
    fields: { screenSize: 50, ram: 50, storage: 100, processor: 255, battery: 100, camera: 100 },
  },
  computers: {
    relation: "computerDetails",
    fields: { processor: 255, ram: 50, storage: 100, graphicsCard: 255, formFactor: 100 },
  },
  consoles: {
    relation: "consoleDetails",
    fields: { manufacturer: 100, storage: 100, resolution: 100, maxPlayers: 100, connectivity: 255 },
  },
  tablets: {
    relation: "tabletDetails",
    fields: { screenSize: 50, ram: 50, storage: 100, processor: 255, battery: 100 },
  },
} as const;

export type CategorySlug = keyof typeof categorySpecs;
export type DetailsRelation = (typeof categorySpecs)[CategorySlug]["relation"];

export const isCategorySlug = (slug: string): slug is CategorySlug =>
  Object.hasOwn(categorySpecs, slug);
