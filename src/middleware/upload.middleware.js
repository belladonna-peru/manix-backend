import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// ── Multer: guarda en memoria (no en disco) ──────────────────────────────────
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }
  },
});

// ── Multer para audio (notas de voz) ─────────────────────────────────────────
export const uploadAudio = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    // Expo graba en m4a/aac; aceptamos los mimetypes comunes de audio
    if (file.mimetype.startsWith("audio/") || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten notas de voz (audio)"));
    }
  },
});

// ── Multer para video (reels) ────────────────────────────────────────────────
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten videos"));
    }
  },
});

// ── Helper: sube buffer a Cloudinary ─────────────────────────────────────────
export const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `manix/${folder}`,
        transformation: options.transformation || [],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};
