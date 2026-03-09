import { fileTypeFromFile } from "file-type";
import fs from "fs";
import multer from "multer";
import path from "path";

/**
 * Configuration du stockage Multer
 * Les fichiers sont enregistrés dans le dossier uploads/ avec un nom unique
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // Génère un nom de fichier unique basé sur le timestamp et un nombre aléatoire
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * Filtre de premier niveau basé sur l'extension et le MIME type déclaré
 * Note : ce filtre peut être contourné — verifyFileType effectue une vérification plus fiable
 */
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

/**
 * Instance Multer configurée
 * Limite la taille des fichiers à 5 Mo
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: fileFilter,
});

/**
 * Middleware de vérification du type de fichier par analyse des magic bytes
 * Détecte le vrai type du fichier indépendamment de son extension ou MIME déclaré
 * Supprime le fichier du disque si le type n'est pas autorisé
 */
export const verifyFileType = async (req, res, next) => {
  // Aucun fichier uploadé, on passe au middleware suivant
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const detectedType = await fileTypeFromFile(filePath);
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!detectedType) {
      // Impossible de détecter le type — suppression par sécurité
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unable to verify file type" });
    }

    if (!allowedMimeTypes.includes(detectedType.mime)) {
      // Type non autorisé — suppression du fichier uploadé
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: `Invalid file type. Detected: ${detectedType.mime}. Allowed: JPEG, PNG`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "File verification" });
  }
};

export default upload;
