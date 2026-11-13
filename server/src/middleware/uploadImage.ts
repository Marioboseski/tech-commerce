import multer from "multer";
import { HttpError } from "../lib/httpError.js";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "../lib/productImages.js";

// Reads one file from a multipart/form-data request (field "image") into
// memory as req.file.buffer. sharp then writes the final WebP file, so the
// original upload never touches the disk.
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, accept) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      accept(null, true);
    } else {
      accept(
        new HttpError(400, "Only JPG, PNG, WebP or AVIF images are allowed", [
          { field: "image", message: "Only JPG, PNG, WebP or AVIF images are allowed" },
        ]),
      );
    }
  },
}).single("image");
