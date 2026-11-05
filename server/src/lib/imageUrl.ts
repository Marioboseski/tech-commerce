import "dotenv/config";

// The database stores a relative path such as "products/laptops-001.webp".
// The API returns a full URL, so moving the images (e.g. to a CDN) only
// requires changing IMAGE_BASE_URL, not the data.
const imageBaseUrl = process.env.IMAGE_BASE_URL;

if (!imageBaseUrl) {
  throw new Error("Missing required environment variable: IMAGE_BASE_URL");
}

const baseUrl = imageBaseUrl.replace(/\/+$/, "");

export const toImageUrl = (imagePath: string | null) =>
  imagePath === null ? null : `${baseUrl}/${imagePath}`;
