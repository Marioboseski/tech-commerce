import express  from "express";
import cors from "cors";
import path from "node:path";
import "dotenv/config";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Product images, e.g. /images/products/laptops-001.webp
app.use("/images", express.static(path.join(import.meta.dirname, "..", "public", "images")));

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})