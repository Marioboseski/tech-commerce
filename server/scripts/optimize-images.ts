// Converts the original product photos in images-source/ into small WebP
// files in public/images/products/, which the server serves at /images.
//
// Usage: put a photo named after the product SKU (e.g. LAPTOPS-001.jpg) in
// images-source/ and run `npm run images:optimize`.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.resolve(import.meta.dirname, "..", "images-source");
const OUTPUT_DIR = path.resolve(import.meta.dirname, "..", "public", "images", "products");
const MAX_SIZE = 800;
const QUALITY = 80;
const MAX_BYTES = 150 * 1024;
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const files = (await readdir(SOURCE_DIR)).filter((file) =>
  SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()),
);

await mkdir(OUTPUT_DIR, { recursive: true });

let tooLarge = 0;

for (const file of files) {
  // Lowercase names: Linux (and Docker) file systems are case-sensitive.
  const name = path.parse(file).name.toLowerCase();
  const output = path.join(OUTPUT_DIR, `${name}.webp`);

  // Keep the original aspect ratio and never upscale; the UI crops with
  // object-fit: cover.
  const info = await sharp(path.join(SOURCE_DIR, file))
    .rotate()
    .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);

  const { size } = await stat(output);
  const warning = size > MAX_BYTES ? "  <-- larger than 150 KB" : "";
  if (warning) {
    tooLarge++;
  }
  console.log(`${file} -> ${name}.webp  ${info.width}x${info.height}  ${(size / 1024).toFixed(1)} KB${warning}`);
}

console.log(`\nOptimized ${files.length} image(s) into ${path.relative(process.cwd(), OUTPUT_DIR)}`);

if (tooLarge > 0) {
  console.error(`${tooLarge} image(s) are larger than 150 KB`);
  process.exitCode = 1;
}
