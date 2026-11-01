import { prisma } from "../lib/prisma.js"

export const getCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
}