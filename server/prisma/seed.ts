import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const database = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: database.hostname,
  port: Number(database.port || 3306),
  user: decodeURIComponent(database.username),
  password: decodeURIComponent(database.password),
  database: database.pathname.slice(1),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const PUBLIC_IMAGES_DIR = path.resolve(import.meta.dirname, "..", "public", "images");

// Relative image path stored in the database, e.g. "products/laptops-001.webp".
// Products without an optimized image get null, so the client shows a fallback.
const getProductImagePath = (sku: string) => {
  const imagePath = `products/${sku.toLowerCase()}.webp`;
  return existsSync(path.join(PUBLIC_IMAGES_DIR, imagePath)) ? imagePath : null;
};

const categories = [
  { name: "Laptops", slug: "laptops" },
  { name: "Mobile Phones", slug: "mobile-phones" },
  { name: "Computers", slug: "computers" },
  { name: "Consoles", slug: "consoles" },
  { name: "Tablets", slug: "tablets" },
] as const;

// The spec fields of each category (same columns as in schema.prisma).
type LaptopSpecs = {
  screenSize: string;
  ram: string;
  processor: string;
  storage: string;
  graphicsCard: string;
};
type MobilePhoneSpecs = {
  screenSize: string;
  ram: string;
  storage: string;
  processor: string;
  battery: string;
  camera: string;
};
type ComputerSpecs = {
  processor: string;
  ram: string;
  storage: string;
  graphicsCard: string;
  formFactor: string;
};
type ConsoleSpecs = {
  manufacturer: string;
  storage: string;
  resolution: string;
  maxPlayers: string;
  connectivity: string;
};
type TabletSpecs = {
  screenSize: string;
  ram: string;
  storage: string;
  processor: string;
  battery: string;
};

type SeedProduct<Specs> = {
  name: string;
  description: string;
  price: number;
  specs: Specs;
};

// Specs follow the real models as closely as possible. For new or upcoming
// models (e.g. iPhone 17, Galaxy S26, Pixel 10) they are realistic estimates.
const laptops: SeedProduct<LaptopSpecs>[] = [
  {
    name: "Dell XPS 15",
    description: "Premium laptop with a high-resolution display.",
    price: 1899.99,
    specs: {
      screenSize: '15.6" OLED 3.5K',
      ram: "32 GB DDR5",
      processor: "Intel Core i9-13900H",
      storage: "1 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4070",
    },
  },
  {
    name: "Lenovo ThinkPad E14",
    description: "Business laptop designed for productivity.",
    price: 999.99,
    specs: {
      screenSize: '14" WUXGA IPS',
      ram: "16 GB DDR5",
      processor: "Intel Core i5-1335U",
      storage: "512 GB SSD",
      graphicsCard: "Intel Iris Xe Graphics",
    },
  },
  {
    name: "HP Pavilion 15",
    description: "Versatile laptop for everyday computing.",
    price: 749.99,
    specs: {
      screenSize: '15.6" Full HD IPS',
      ram: "16 GB DDR4",
      processor: "AMD Ryzen 5 7530U",
      storage: "512 GB SSD",
      graphicsCard: "AMD Radeon Graphics",
    },
  },
  {
    name: "ASUS Zenbook 14",
    description: "Lightweight laptop for work and travel.",
    price: 1199.99,
    specs: {
      screenSize: '14" 2.8K OLED',
      ram: "16 GB LPDDR5X",
      processor: "Intel Core Ultra 7 155H",
      storage: "1 TB SSD",
      graphicsCard: "Intel Arc Graphics",
    },
  },
  {
    name: "Acer Aspire 5",
    description: "Practical laptop for everyday tasks.",
    price: 649.99,
    specs: {
      screenSize: '15.6" Full HD IPS',
      ram: "8 GB DDR4",
      processor: "Intel Core i5-1335U",
      storage: "512 GB SSD",
      graphicsCard: "Intel Iris Xe Graphics",
    },
  },
  {
    name: "MacBook Air 13",
    description: "Lightweight laptop for work and study.",
    price: 1299.99,
    specs: {
      screenSize: '13.6" Liquid Retina',
      ram: "16 GB unified memory",
      processor: "Apple M4",
      storage: "256 GB SSD",
      graphicsCard: "Apple 8-core GPU",
    },
  },
  {
    name: "MSI Katana 15",
    description: "Performance laptop designed for gaming.",
    price: 1499.99,
    specs: {
      screenSize: '15.6" Full HD 144 Hz',
      ram: "16 GB DDR5",
      processor: "Intel Core i7-13620H",
      storage: "1 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4060",
    },
  },
  {
    name: "Lenovo Yoga 7",
    description: "Convertible laptop for flexible working.",
    price: 1099.99,
    specs: {
      screenSize: '14" 2.2K touch',
      ram: "16 GB LPDDR5",
      processor: "AMD Ryzen 7 8840HS",
      storage: "1 TB SSD",
      graphicsCard: "AMD Radeon 780M",
    },
  },
  {
    name: "HP Envy 16",
    description: "Laptop for creative work and multitasking.",
    price: 1599.99,
    specs: {
      screenSize: '16" 2.5K 120 Hz',
      ram: "32 GB DDR5",
      processor: "Intel Core i7-13700H",
      storage: "1 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4060",
    },
  },
  {
    name: "ASUS ROG Zephyrus G16",
    description: "High-performance gaming laptop.",
    price: 2199.99,
    specs: {
      screenSize: '16" 2.5K OLED 240 Hz',
      ram: "32 GB LPDDR5X",
      processor: "Intel Core Ultra 9 185H",
      storage: "2 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4080",
    },
  },
];

const mobilePhones: SeedProduct<MobilePhoneSpecs>[] = [
  {
    name: "Apple iPhone 17",
    description: "Smartphone with an advanced camera system.",
    price: 899.99,
    specs: {
      screenSize: '6.3" OLED 120 Hz',
      ram: "8 GB",
      storage: "256 GB",
      processor: "Apple A19",
      battery: "3600 mAh",
      camera: "48 MP main + 48 MP ultra-wide",
    },
  },
  {
    name: "Samsung Galaxy S26",
    description: "Premium Android smartphone.",
    price: 999.99,
    specs: {
      screenSize: '6.2" Dynamic AMOLED 120 Hz',
      ram: "12 GB",
      storage: "256 GB",
      processor: "Snapdragon 8 Elite Gen 2",
      battery: "4000 mAh",
      camera: "50 MP main + 12 MP ultra-wide + 10 MP telephoto",
    },
  },
  {
    name: "Google Pixel 10",
    description: "Smartphone with advanced computational photography.",
    price: 799.99,
    specs: {
      screenSize: '6.3" OLED 120 Hz',
      ram: "12 GB",
      storage: "128 GB",
      processor: "Google Tensor G5",
      battery: "4970 mAh",
      camera: "48 MP main + 13 MP ultra-wide + 10.8 MP telephoto",
    },
  },
  {
    name: "OnePlus 13",
    description: "High-performance smartphone with fast charging.",
    price: 749.99,
    specs: {
      screenSize: '6.82" AMOLED 120 Hz',
      ram: "12 GB",
      storage: "256 GB",
      processor: "Snapdragon 8 Elite",
      battery: "6000 mAh",
      camera: "50 MP main + 50 MP ultra-wide + 50 MP telephoto",
    },
  },
  {
    name: "Xiaomi 15",
    description: "Feature-rich smartphone for everyday use.",
    price: 699.99,
    specs: {
      screenSize: '6.36" AMOLED 120 Hz',
      ram: "12 GB",
      storage: "256 GB",
      processor: "Snapdragon 8 Elite",
      battery: "5240 mAh",
      camera: "50 MP Leica triple camera",
    },
  },
  {
    name: "Samsung Galaxy A56",
    description: "Mid-range smartphone for everyday tasks.",
    price: 449.99,
    specs: {
      screenSize: '6.7" Super AMOLED 120 Hz',
      ram: "8 GB",
      storage: "128 GB",
      processor: "Samsung Exynos 1580",
      battery: "5000 mAh",
      camera: "50 MP main + 12 MP ultra-wide + 5 MP macro",
    },
  },
  {
    name: "Apple iPhone 16",
    description: "Smartphone with a powerful mobile processor.",
    price: 799.99,
    specs: {
      screenSize: '6.1" OLED',
      ram: "8 GB",
      storage: "128 GB",
      processor: "Apple A18",
      battery: "3561 mAh",
      camera: "48 MP main + 12 MP ultra-wide",
    },
  },
  {
    name: "Motorola Edge 60",
    description: "Smartphone with a large display.",
    price: 499.99,
    specs: {
      screenSize: '6.67" pOLED 120 Hz',
      ram: "8 GB",
      storage: "256 GB",
      processor: "MediaTek Dimensity 7400",
      battery: "5200 mAh",
      camera: "50 MP main + 10 MP telephoto + 50 MP ultra-wide",
    },
  },
  {
    name: "Nothing Phone 3",
    description: "Smartphone with a distinctive design.",
    price: 699.99,
    specs: {
      screenSize: '6.67" AMOLED 120 Hz',
      ram: "12 GB",
      storage: "256 GB",
      processor: "Snapdragon 8s Gen 4",
      battery: "5150 mAh",
      camera: "50 MP main + 50 MP ultra-wide + 50 MP telephoto",
    },
  },
  {
    name: "Google Pixel 9a",
    description: "Smartphone with a versatile camera.",
    price: 499.99,
    specs: {
      screenSize: '6.3" OLED 120 Hz',
      ram: "8 GB",
      storage: "128 GB",
      processor: "Google Tensor G4",
      battery: "5100 mAh",
      camera: "48 MP main + 13 MP ultra-wide",
    },
  },
];

const computers: SeedProduct<ComputerSpecs>[] = [
  {
    name: "Dell OptiPlex Tower",
    description: "Desktop computer for business environments.",
    price: 899.99,
    specs: {
      processor: "Intel Core i5-14500",
      ram: "16 GB DDR5",
      storage: "512 GB SSD",
      graphicsCard: "Intel UHD Graphics 770",
      formFactor: "Tower",
    },
  },
  {
    name: "HP ProDesk 400",
    description: "Business desktop for everyday productivity.",
    price: 749.99,
    specs: {
      processor: "Intel Core i5-13500",
      ram: "8 GB DDR4",
      storage: "256 GB SSD",
      graphicsCard: "Intel UHD Graphics 770",
      formFactor: "Small form factor",
    },
  },
  {
    name: "Lenovo ThinkCentre M70t",
    description: "Desktop computer for office workloads.",
    price: 849.99,
    specs: {
      processor: "Intel Core i7-13700",
      ram: "16 GB DDR4",
      storage: "512 GB SSD",
      graphicsCard: "Intel UHD Graphics 770",
      formFactor: "Tower",
    },
  },
  {
    name: "Apple Mac mini",
    description: "Compact desktop computer for work.",
    price: 799.99,
    specs: {
      processor: "Apple M4",
      ram: "16 GB unified memory",
      storage: "256 GB SSD",
      graphicsCard: "Apple 10-core GPU",
      formFactor: "Compact",
    },
  },
  {
    name: "ASUS ExpertCenter",
    description: "Desktop computer for business use.",
    price: 699.99,
    specs: {
      processor: "Intel Core i5-13400",
      ram: "8 GB DDR4",
      storage: "512 GB SSD",
      graphicsCard: "Intel UHD Graphics 730",
      formFactor: "Mini tower",
    },
  },
  {
    name: "Acer Aspire TC",
    description: "Desktop computer for home and office.",
    price: 649.99,
    specs: {
      processor: "Intel Core i5-12400",
      ram: "16 GB DDR4",
      storage: "1 TB SSD",
      graphicsCard: "Intel UHD Graphics 730",
      formFactor: "Mid tower",
    },
  },
  {
    name: "MSI MAG Infinite",
    description: "Desktop computer configured for gaming.",
    price: 1399.99,
    specs: {
      processor: "Intel Core i7-14700F",
      ram: "32 GB DDR5",
      storage: "1 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4070",
      formFactor: "Mid tower",
    },
  },
  {
    name: "Corsair Vengeance PC",
    description: "Performance desktop for gaming and creation.",
    price: 1799.99,
    specs: {
      processor: "AMD Ryzen 9 7950X3D",
      ram: "64 GB DDR5",
      storage: "2 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4080 Super",
      formFactor: "Mid tower",
    },
  },
  {
    name: "HP Z2 Tower",
    description: "Workstation for professional applications.",
    price: 1899.99,
    specs: {
      processor: "Intel Core i9-14900K",
      ram: "64 GB DDR5 ECC",
      storage: "2 TB SSD",
      graphicsCard: "NVIDIA RTX 4000 Ada",
      formFactor: "Workstation tower",
    },
  },
  {
    name: "Lenovo Legion Tower",
    description: "Desktop computer designed for gaming.",
    price: 1599.99,
    specs: {
      processor: "AMD Ryzen 7 7800X3D",
      ram: "32 GB DDR5",
      storage: "1 TB SSD",
      graphicsCard: "NVIDIA GeForce RTX 4070 Ti Super",
      formFactor: "Mid tower",
    },
  },
];

const consoles: SeedProduct<ConsoleSpecs>[] = [
  {
    name: "PlayStation 5",
    description: "Home gaming console with high-performance graphics.",
    price: 499.99,
    specs: {
      manufacturer: "Sony",
      storage: "1 TB SSD",
      resolution: "Up to 4K 120 Hz",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 6, Bluetooth 5.1, HDMI 2.1",
    },
  },
  {
    name: "PlayStation 5 Digital Edition",
    description: "Digital-only home gaming console.",
    price: 449.99,
    specs: {
      manufacturer: "Sony",
      storage: "1 TB SSD",
      resolution: "Up to 4K 120 Hz",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 6, Bluetooth 5.1, HDMI 2.1",
    },
  },
  {
    name: "Xbox Series X",
    description: "Home gaming console with high-resolution gaming.",
    price: 499.99,
    specs: {
      manufacturer: "Microsoft",
      storage: "1 TB SSD",
      resolution: "Up to 4K 120 Hz",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 5, Bluetooth, HDMI 2.1",
    },
  },
  {
    name: "Xbox Series S",
    description: "Compact digital gaming console.",
    price: 299.99,
    specs: {
      manufacturer: "Microsoft",
      storage: "512 GB SSD",
      resolution: "Up to 1440p 120 Hz",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 5, Bluetooth, HDMI 2.1",
    },
  },
  {
    name: "Nintendo Switch OLED",
    description: "Portable and docked gaming console.",
    price: 349.99,
    specs: {
      manufacturer: "Nintendo",
      storage: "64 GB",
      resolution: "720p handheld, 1080p docked",
      maxPlayers: "1–8 players",
      connectivity: "Wi-Fi, Bluetooth 4.1, HDMI (dock)",
    },
  },
  {
    name: "Nintendo Switch Lite",
    description: "Portable handheld gaming console.",
    price: 229.99,
    specs: {
      manufacturer: "Nintendo",
      storage: "32 GB",
      resolution: "720p handheld",
      maxPlayers: "1–8 players (local wireless)",
      connectivity: "Wi-Fi, Bluetooth 4.1",
    },
  },
  {
    name: "PlayStation 5 Pro",
    description: "Enhanced console for demanding games.",
    price: 699.99,
    specs: {
      manufacturer: "Sony",
      storage: "2 TB SSD",
      resolution: "Up to 4K 120 Hz, 8K support",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 7, Bluetooth 5.1, HDMI 2.1",
    },
  },
  {
    name: "Xbox Series S 1TB",
    description: "Digital console with expanded storage.",
    price: 349.99,
    specs: {
      manufacturer: "Microsoft",
      storage: "1 TB SSD",
      resolution: "Up to 1440p 120 Hz",
      maxPlayers: "1–4 players",
      connectivity: "Wi-Fi 5, Bluetooth, HDMI 2.1",
    },
  },
  {
    name: "Steam Deck OLED",
    description: "Portable PC gaming handheld.",
    price: 549.99,
    specs: {
      manufacturer: "Valve",
      storage: "1 TB SSD",
      resolution: "1280 × 800 OLED 90 Hz",
      maxPlayers: "1 player (more with controllers)",
      connectivity: "Wi-Fi 6E, Bluetooth 5.3, USB-C",
    },
  },
  {
    name: "ASUS ROG Ally",
    description: "Portable Windows gaming device.",
    price: 599.99,
    specs: {
      manufacturer: "ASUS",
      storage: "512 GB SSD",
      resolution: "1920 × 1080 120 Hz",
      maxPlayers: "1 player (more with controllers)",
      connectivity: "Wi-Fi 6E, Bluetooth 5.2, USB-C",
    },
  },
];

const tablets: SeedProduct<TabletSpecs>[] = [
  {
    name: "Apple iPad Air",
    description: "Tablet for productivity and entertainment.",
    price: 599.99,
    specs: {
      screenSize: '11" Liquid Retina',
      ram: "8 GB",
      storage: "128 GB",
      processor: "Apple M3",
      battery: "7606 mAh",
    },
  },
  {
    name: "Apple iPad Pro",
    description: "High-performance tablet for creative work.",
    price: 999.99,
    specs: {
      screenSize: '13" Ultra Retina XDR OLED',
      ram: "16 GB",
      storage: "1 TB",
      processor: "Apple M5",
      battery: "10290 mAh",
    },
  },
  {
    name: "Samsung Galaxy Tab S10",
    description: "Android tablet for work and entertainment.",
    price: 799.99,
    specs: {
      screenSize: '11" Dynamic AMOLED 2X',
      ram: "12 GB",
      storage: "256 GB",
      processor: "MediaTek Dimensity 9300+",
      battery: "8400 mAh",
    },
  },
  {
    name: "Samsung Galaxy Tab A9+",
    description: "Tablet for everyday use.",
    price: 269.99,
    specs: {
      screenSize: '11" LCD 90 Hz',
      ram: "4 GB",
      storage: "64 GB",
      processor: "Snapdragon 695",
      battery: "7040 mAh",
    },
  },
  {
    name: "Lenovo Tab P12",
    description: "Large-screen tablet for media and productivity.",
    price: 399.99,
    specs: {
      screenSize: '12.7" 3K LCD',
      ram: "8 GB",
      storage: "128 GB",
      processor: "MediaTek Dimensity 7050",
      battery: "10200 mAh",
    },
  },
  {
    name: "Microsoft Surface Pro",
    description: "Windows tablet designed for productivity.",
    price: 999.99,
    specs: {
      screenSize: '13" PixelSense OLED',
      ram: "16 GB",
      storage: "512 GB SSD",
      processor: "Snapdragon X Elite",
      battery: "53 Wh",
    },
  },
  {
    name: "Xiaomi Pad 7",
    description: "Tablet with a high-resolution display.",
    price: 399.99,
    specs: {
      screenSize: '11.2" 3.2K LCD 144 Hz',
      ram: "8 GB",
      storage: "256 GB",
      processor: "Snapdragon 7+ Gen 3",
      battery: "8850 mAh",
    },
  },
  {
    name: "OnePlus Pad 2",
    description: "Performance tablet for multitasking.",
    price: 549.99,
    specs: {
      screenSize: '12.1" 3K LCD 144 Hz',
      ram: "12 GB",
      storage: "256 GB",
      processor: "Snapdragon 8 Gen 3",
      battery: "9510 mAh",
    },
  },
  {
    name: "Amazon Fire Max 11",
    description: "Tablet for reading and entertainment.",
    price: 229.99,
    specs: {
      screenSize: '11" 2K LCD',
      ram: "4 GB",
      storage: "64 GB",
      processor: "MediaTek MT8188J",
      battery: "7500 mAh",
    },
  },
  {
    name: "Apple iPad mini",
    description: "Compact tablet for work on the go.",
    price: 499.99,
    specs: {
      screenSize: '8.3" Liquid Retina',
      ram: "8 GB",
      storage: "128 GB",
      processor: "Apple A17 Pro",
      battery: "5078 mAh",
    },
  },
];

// Creates the product if its SKU is new. An existing product is NOT changed
// (name, price, image, archived...), so edits from the admin panel and
// uploaded images survive running the seed again.
const upsertProduct = async (
  sku: string,
  categoryId: number,
  { name, description, price }: SeedProduct<unknown>,
) =>
  prisma.product.upsert({
    where: { sku },
    update: {},
    create: { sku, name, description, price, imageUrl: getProductImagePath(sku), categoryId },
    select: { id: true },
  });

// LAPTOPS-001, MOBILE_PHONES-003, ... (also the image file name).
const skuFor = (categorySlug: string, index: number) =>
  `${categorySlug.toUpperCase().replaceAll("-", "_")}-${String(index + 1).padStart(3, "0")}`;

const categoryIdFor = async (slug: string) =>
  (await prisma.category.findUniqueOrThrow({ where: { slug } })).id;

async function seed() {
  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { name: categoryData.name },
      create: categoryData,
    });
  }

  // Specs are always written, also for existing products, so changing a
  // value here and running the seed again updates the shop.
  const laptopsId = await categoryIdFor("laptops");
  for (const [index, item] of laptops.entries()) {
    const { id } = await upsertProduct(skuFor("laptops", index), laptopsId, item);
    await prisma.laptopDetails.upsert({
      where: { productId: id },
      update: item.specs,
      create: { productId: id, ...item.specs },
    });
  }

  const mobilePhonesId = await categoryIdFor("mobile-phones");
  for (const [index, item] of mobilePhones.entries()) {
    const { id } = await upsertProduct(skuFor("mobile-phones", index), mobilePhonesId, item);
    await prisma.mobilePhoneDetails.upsert({
      where: { productId: id },
      update: item.specs,
      create: { productId: id, ...item.specs },
    });
  }

  const computersId = await categoryIdFor("computers");
  for (const [index, item] of computers.entries()) {
    const { id } = await upsertProduct(skuFor("computers", index), computersId, item);
    await prisma.computerDetails.upsert({
      where: { productId: id },
      update: item.specs,
      create: { productId: id, ...item.specs },
    });
  }

  const consolesId = await categoryIdFor("consoles");
  for (const [index, item] of consoles.entries()) {
    const { id } = await upsertProduct(skuFor("consoles", index), consolesId, item);
    await prisma.consoleDetails.upsert({
      where: { productId: id },
      update: item.specs,
      create: { productId: id, ...item.specs },
    });
  }

  const tabletsId = await categoryIdFor("tablets");
  for (const [index, item] of tablets.entries()) {
    const { id } = await upsertProduct(skuFor("tablets", index), tabletsId, item);
    await prisma.tabletDetails.upsert({
      where: { productId: id },
      update: item.specs,
      create: { productId: id, ...item.specs },
    });
  }

  const total =
    laptops.length + mobilePhones.length + computers.length + consoles.length + tablets.length;
  console.log(`Seed completed: ${categories.length} categories and ${total} products processed.`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
