import { fileTypeFromFile } from "file-type";
import fs from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export const verifyFileType = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const detectedType = await fileTypeFromFile(filePath);
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!detectedType) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unable to verify file type" });
    }

    if (!allowedMimeTypes.includes(detectedType.mime)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: `Invalid file type. Detected: ${detectedType.mime}. Allowed: JPEG, PNG`,
      });
    }

    next();
  } catch (error) {
    console.error("File verification error:", error);
    return res.status(500).json({ error: "File verification" });
  }
};

export default upload;
