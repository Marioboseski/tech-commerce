import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { HttpError } from "./httpError.js";

// Served at /images by express.static in server.ts.
const IMAGES_DIR = path.join(import.meta.dirname, "..", "..", "public", "images");

// Uploads go to their own folder: the seed photos in products/ are part of
// the code (in Git), uploads are shop data (in .gitignore, a Docker volume
// later). Only files in this folder are ever deleted by the app.
const UPLOADS_FOLDER = "uploads";

// Same settings as scripts/optimize-images.ts.
const MAX_SIZE = 800;
const QUALITY = 80;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Turns an uploaded photo into a small WebP file and returns the path to
// store in the database, e.g. "uploads/laptops-001-1731500000000.webp".
// The time in the name makes every upload a new URL, so browsers do not
// keep showing the old cached picture.
export const saveProductImage = async (buffer: Buffer, sku: string) => {
  const fileName = `${sku.toLowerCase()}-${Date.now()}.webp`;
  const relativePath = `${UPLOADS_FOLDER}/${fileName}`;

  await mkdir(path.join(IMAGES_DIR, UPLOADS_FOLDER), { recursive: true });

  try {
    await sharp(buffer)
      // Use the camera's orientation, so phone photos are not sideways.
      .rotate()
      .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(IMAGES_DIR, relativePath));
  } catch {
    // The file said it was an image, but sharp cannot read it (renamed
    // .txt, broken file...). The browser's type cannot be trusted.
    throw new HttpError(400, "This file is not a valid image", [
      { field: "image", message: "This file is not a valid image" },
    ]);
  }

  return relativePath;
};

// Deletes an image that was uploaded through the admin panel.
// Seed photos (products/...) are never deleted.
export const deleteUploadedImage = async (relativePath: string | null) => {
  if (!relativePath?.startsWith(`${UPLOADS_FOLDER}/`)) {
    return;
  }
  // The file may already be gone; that is fine.
  await unlink(path.join(IMAGES_DIR, relativePath)).catch(() => {});
};
