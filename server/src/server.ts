import express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import "dotenv/config";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("Missing required environment variable: CLIENT_URL");
}

// Cookies only work across origins (5173 -> 5000) when the server names
// the exact origin (not "*") and allows credentials.
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
// Reads the Cookie header into req.cookies (needed for the login cookie).
app.use(cookieParser());

// Product images, e.g. /images/products/laptops-001.webp
app.use("/images", express.static(path.join(import.meta.dirname, "..", "public", "images")));

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})