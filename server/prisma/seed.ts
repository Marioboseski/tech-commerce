import "dotenv/config";
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

const categories = [
  { name: "Laptops", slug: "laptops" },
  { name: "Mobile Phones", slug: "mobile-phones" },
  { name: "Computers", slug: "computers" },
  { name: "Consoles", slug: "consoles" },
  { name: "Tablets", slug: "tablets" },
] as const;

const products = [
  {
    categorySlug: "laptops",
    items: [
      ["Dell XPS 15", "Premium laptop with a high-resolution display.", 1899.99],
      ["Lenovo ThinkPad E14", "Business laptop designed for productivity.", 999.99],
      ["HP Pavilion 15", "Versatile laptop for everyday computing.", 749.99],
      ["ASUS Zenbook 14", "Lightweight laptop for work and travel.", 1199.99],
      ["Acer Aspire 5", "Practical laptop for everyday tasks.", 649.99],
      ["MacBook Air 13", "Lightweight laptop for work and study.", 1299.99],
      ["MSI Katana 15", "Performance laptop designed for gaming.", 1499.99],
      ["Lenovo Yoga 7", "Convertible laptop for flexible working.", 1099.99],
      ["HP Envy 16", "Laptop for creative work and multitasking.", 1599.99],
      ["ASUS ROG Zephyrus G16", "High-performance gaming laptop.", 2199.99],
    ],
  },
  {
    categorySlug: "mobile-phones",
    items: [
      ["Apple iPhone 17", "Smartphone with an advanced camera system.", 899.99],
      ["Samsung Galaxy S26", "Premium Android smartphone.", 999.99],
      ["Google Pixel 10", "Smartphone with advanced computational photography.", 799.99],
      ["OnePlus 13", "High-performance smartphone with fast charging.", 749.99],
      ["Xiaomi 15", "Feature-rich smartphone for everyday use.", 699.99],
      ["Samsung Galaxy A56", "Mid-range smartphone for everyday tasks.", 449.99],
      ["Apple iPhone 16", "Smartphone with a powerful mobile processor.", 799.99],
      ["Motorola Edge 60", "Smartphone with a large display.", 499.99],
      ["Nothing Phone 3", "Smartphone with a distinctive design.", 699.99],
      ["Google Pixel 9a", "Smartphone with a versatile camera.", 499.99],
    ],
  },
  {
    categorySlug: "computers",
    items: [
      ["Dell OptiPlex Tower", "Desktop computer for business environments.", 899.99],
      ["HP ProDesk 400", "Business desktop for everyday productivity.", 749.99],
      ["Lenovo ThinkCentre M70t", "Desktop computer for office workloads.", 849.99],
      ["Apple Mac mini", "Compact desktop computer for work.", 799.99],
      ["ASUS ExpertCenter", "Desktop computer for business use.", 699.99],
      ["Acer Aspire TC", "Desktop computer for home and office.", 649.99],
      ["MSI MAG Infinite", "Desktop computer configured for gaming.", 1399.99],
      ["Corsair Vengeance PC", "Performance desktop for gaming and creation.", 1799.99],
      ["HP Z2 Tower", "Workstation for professional applications.", 1899.99],
      ["Lenovo Legion Tower", "Desktop computer designed for gaming.", 1599.99],
    ],
  },
  {
    categorySlug: "consoles",
    items: [
      ["PlayStation 5", "Home gaming console with high-performance graphics.", 499.99],
      ["PlayStation 5 Digital Edition", "Digital-only home gaming console.", 449.99],
      ["Xbox Series X", "Home gaming console with high-resolution gaming.", 499.99],
      ["Xbox Series S", "Compact digital gaming console.", 299.99],
      ["Nintendo Switch OLED", "Portable and docked gaming console.", 349.99],
      ["Nintendo Switch Lite", "Portable handheld gaming console.", 229.99],
      ["PlayStation 5 Pro", "Enhanced console for demanding games.", 699.99],
      ["Xbox Series S 1TB", "Digital console with expanded storage.", 349.99],
      ["Steam Deck OLED", "Portable PC gaming handheld.", 549.99],
      ["ASUS ROG Ally", "Portable Windows gaming device.", 599.99],
    ],
  },
  {
    categorySlug: "tablets",
    items: [
      ["Apple iPad Air", "Tablet for productivity and entertainment.", 599.99],
      ["Apple iPad Pro", "High-performance tablet for creative work.", 999.99],
      ["Samsung Galaxy Tab S10", "Android tablet for work and entertainment.", 799.99],
      ["Samsung Galaxy Tab A9+", "Tablet for everyday use.", 269.99],
      ["Lenovo Tab P12", "Large-screen tablet for media and productivity.", 399.99],
      ["Microsoft Surface Pro", "Windows tablet designed for productivity.", 999.99],
      ["Xiaomi Pad 7", "Tablet with a high-resolution display.", 399.99],
      ["OnePlus Pad 2", "Performance tablet for multitasking.", 549.99],
      ["Amazon Fire Max 11", "Tablet for reading and entertainment.", 229.99],
      ["Apple iPad mini", "Compact tablet for work on the go.", 499.99],
    ],
  },
] as const;

async function seed() {
  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { name: categoryData.name },
      create: categoryData,
    });
  }

  for (const group of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: group.categorySlug },
    });

    for (const [index, item] of group.items.entries()) {
      const [name, description, price] = item;
      const sku = `${group.categorySlug.toUpperCase().replaceAll("-", "_")}-${String(index + 1).padStart(3, "0")}`;

      const product = await prisma.product.upsert({
        where: { sku },
        update: {
          name,
          description,
          price,
          categoryId: category.id,
        },
        create: {
          sku,
          name,
          description,
          price,
          categoryId: category.id,
        },
      });

      if (group.categorySlug === "laptops") {
        await prisma.laptopDetails.upsert({
          where: { productId: product.id },
          update: {},
          create: {
            productId: product.id,
            screenSize: "15.6 inches",
            ram: index % 2 === 0 ? "16 GB" : "32 GB",
            processor: "Intel Core i7",
            storage: "1 TB SSD",
            graphicsCard: "Integrated / dedicated graphics",
          },
        });
      } else if (group.categorySlug === "mobile-phones") {
        await prisma.mobilePhoneDetails.upsert({
          where: { productId: product.id },
          update: {},
          create: {
            productId: product.id,
            screenSize: "6.5 inches",
            ram: index % 2 === 0 ? "8 GB" : "12 GB",
            storage: "256 GB",
            processor: "Octa-core processor",
            battery: "5000 mAh",
            camera: "50 MP main camera",
          },
        });
      } else if (group.categorySlug === "computers") {
        await prisma.computerDetails.upsert({
          where: { productId: product.id },
          update: {},
          create: {
            productId: product.id,
            processor: "Intel Core i7",
            ram: index % 2 === 0 ? "16 GB" : "32 GB",
            storage: "1 TB SSD",
            graphicsCard: "Integrated / dedicated graphics",
            formFactor: index % 2 === 0 ? "Tower" : "Compact",
          },
        });
      } else if (group.categorySlug === "consoles") {
        await prisma.consoleDetails.upsert({
          where: { productId: product.id },
          update: {},
          create: {
            productId: product.id,
            manufacturer: name.split(" ")[0] ?? "Unknown",
            storage: "1 TB SSD",
            resolution: "Up to 4K",
            maxPlayers: "1–4 players",
            connectivity: "Wi-Fi, Bluetooth, HDMI",
          },
        });
      } else if (group.categorySlug === "tablets") {
        await prisma.tabletDetails.upsert({
          where: { productId: product.id },
          update: {},
          create: {
            productId: product.id,
            screenSize: "11 inches",
            ram: index % 2 === 0 ? "8 GB" : "12 GB",
            storage: "256 GB",
            processor: "Octa-core processor",
            battery: "8000 mAh",
          },
        });
      }
    }
  }

  console.log("Seed completed: 5 categories and 50 products processed.");
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
