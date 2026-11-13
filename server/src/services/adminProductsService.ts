import { prisma } from "../lib/prisma.js";
import { toApiProduct } from "../lib/apiProduct.js";
import { categorySpecs, isCategorySlug } from "../lib/productCategories.js";
import type { CategorySlug } from "../lib/productCategories.js";
import type { ProductInput } from "../schemas/adminProductSchemas.js";
import { deleteUploadedImage, saveProductImage } from "../lib/productImages.js";
import { Prisma } from "../../generated/prisma/client.js";

type ListFilters = {
  page: number;
  pageSize: number;
  search?: string | undefined;
  categoryId?: number | undefined;
  status: "active" | "archived" | "all";
};

const listSelect = {
  id: true,
  sku: true,
  name: true,
  price: true,
  imageUrl: true,
  isActive: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect;

const detailsInclude = {
  category: { select: { id: true, name: true, slug: true } },
  laptopDetails: true,
  mobilePhoneDetails: true,
  computerDetails: true,
  consoleDetails: true,
  tabletDetails: true,
} satisfies Prisma.ProductInclude;

// One page of products for the admin table, archived ones included.
export const listProducts = async ({ page, pageSize, search, categoryId, status }: ListFilters) => {
  const where: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [{ name: { contains: search } }, { sku: { contains: search } }],
    }),
    ...(categoryId !== undefined && { categoryId }),
    ...(status !== "all" && { isActive: status === "active" }),
  };

  // The total is needed for "page 2 of 5", so both run together.
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: listSelect,
    }),
  ]);

  return {
    items: products.map(toApiProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

// One product with its specs, also when archived. null if it does not exist.
export const getProduct = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id }, include: detailsInclude });
  return product ? toApiProduct(product) : null;
};

type SaveResult =
  | { status: "saved"; product: NonNullable<Awaited<ReturnType<typeof getProduct>>> }
  | { status: "category_not_found" }
  | { status: "sku_taken" }
  | { status: "not_found" }
  | { status: "category_changed" };

const findCategorySlug = async (categoryId: number): Promise<CategorySlug | null> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });
  return category && isCategorySlug(category.slug) ? category.slug : null;
};

// The details are validated by the controller with detailsSchemaFor(slug),
// so they have exactly the fields of that category's table.
type ValidatedDetails = Record<string, string>;

export const createProduct = async (
  input: ProductInput,
  details: ValidatedDetails,
): Promise<SaveResult> => {
  const slug = await findCategorySlug(input.categoryId);
  if (!slug) {
    return { status: "category_not_found" };
  }

  const existing = await prisma.product.findUnique({ where: { sku: input.sku }, select: { id: true } });
  if (existing) {
    return { status: "sku_taken" };
  }

  const { relation } = categorySpecs[slug];
  const product = await prisma.product.create({
    data: {
      sku: input.sku,
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      // e.g. laptopDetails: { create: { screenSize, ram, ... } }
      [relation]: { create: details },
    } as Prisma.ProductUncheckedCreateInput,
    include: detailsInclude,
  });

  return { status: "saved", product: toApiProduct(product) };
};

// The category cannot change: the specs live in a different table per
// category, so changing it would mean moving and re-entering all specs.
export const updateProduct = async (
  id: number,
  input: ProductInput,
  details: ValidatedDetails,
): Promise<SaveResult> => {
  const current = await prisma.product.findUnique({
    where: { id },
    select: { categoryId: true, category: { select: { slug: true } } },
  });
  if (!current) {
    return { status: "not_found" };
  }
  if (current.categoryId !== input.categoryId) {
    return { status: "category_changed" };
  }
  if (!isCategorySlug(current.category.slug)) {
    return { status: "category_not_found" };
  }

  const skuOwner = await prisma.product.findUnique({ where: { sku: input.sku }, select: { id: true } });
  if (skuOwner && skuOwner.id !== id) {
    return { status: "sku_taken" };
  }

  const { relation } = categorySpecs[current.category.slug];
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: input.sku,
      name: input.name,
      description: input.description,
      price: input.price,
      // upsert: older products might have no specs row yet.
      [relation]: { upsert: { create: details, update: details } },
    } as Prisma.ProductUncheckedUpdateInput,
    include: detailsInclude,
  });

  return { status: "saved", product: toApiProduct(product) };
};

// Archive (isActive = false) or restore. Returns null if it does not exist.
export const setProductActive = async (id: number, isActive: boolean) => {
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return null;
  }

  // Archived products cannot be bought, so they also leave every cart.
  // Favorites stay (hidden in the shop) and come back if it is restored.
  const [product] = await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { isActive }, include: detailsInclude }),
    ...(isActive ? [] : [prisma.cartItem.deleteMany({ where: { productId: id } })]),
  ]);

  return toApiProduct(product);
};

// Saves a new photo for a product and replaces the old one.
// Returns null when the product does not exist.
export const setProductImage = async (id: number, buffer: Buffer) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { sku: true, imageUrl: true },
  });
  if (!product) {
    return null;
  }

  const newPath = await saveProductImage(buffer, product.sku);

  try {
    await prisma.product.update({ where: { id }, data: { imageUrl: newPath } });
  } catch (error) {
    // The database was not updated, so the new file would never be used.
    await deleteUploadedImage(newPath);
    throw error;
  }

  // Only after the database points to the new file.
  await deleteUploadedImage(product.imageUrl);
  return getProduct(id);
};

// The shop then shows the category placeholder. null if no such product.
export const removeProductImage = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!product) {
    return null;
  }

  await prisma.product.update({ where: { id }, data: { imageUrl: null } });
  await deleteUploadedImage(product.imageUrl);
  return getProduct(id);
};
