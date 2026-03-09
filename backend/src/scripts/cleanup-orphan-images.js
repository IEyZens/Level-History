import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

// Reconstruire __dirname en ESM (non disponible nativement contrairement à CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de maintenance — supprime les images orphelines du dossier uploads/
 * Une image est considérée orpheline si elle n'est référencée par aucune personnalité en base
 * À lancer manuellement : node src/scripts/cleanup-orphan-images.js
 */
async function cleanupOrphanImages() {
  try {
    console.log("Starting cleanup of orphan images...\n");

    // Récupérer les noms de fichiers de toutes les images référencées en base
    const personalities = await prisma.personality.findMany({
      select: { image: true },
    });

    const usedImages = personalities
      .filter((p) => p.image) // Exclure les personnalités sans image
      .map((p) => path.basename(p.image)); // Garder uniquement le nom du fichier

    console.log(`Images in database: ${usedImages.length}`);

    const uploadsDir = path.join(__dirname, "../../uploads");

    if (!fs.existsSync(uploadsDir)) {
      console.log("Uploads directory does not exist!");
      return;
    }

    const allFiles = fs.readdirSync(uploadsDir);
    console.log(`Files in uploads/: ${allFiles.length}`);

    // Identifier les fichiers présents sur le disque mais absents de la base
    const orphans = allFiles.filter((file) => {
      // Ignorer les fichiers système et dossiers de test
      if (file === ".gitkeep" || file === "test") return false;

      const filePath = path.join(uploadsDir, file);

      // Ignorer les sous-dossiers
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return false;
      } catch (error) {
        return false; // Fichier inaccessible, on l'ignore
      }

      // Orphelin = fichier sur disque non référencé en base
      return !usedImages.includes(file);
    });

    console.log(`\nOrphan images found: ${orphans.length}\n`);

    if (orphans.length === 0) {
      console.log("No orphan images to delete!");
      return;
    }

    console.log("Files to delete:");
    orphans.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    // Supprimer chaque fichier orphelin du disque
    console.log("\nDeleting...");
    let deletedCount = 0;

    orphans.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`  Deleted: ${file}`);
        deletedCount++;
      } catch (error) {
        console.error(`  Failed to delete ${file}: ${error.message}`);
      }
    });

    console.log(
      `\nCleanup complete! Deleted ${deletedCount}/${orphans.length} files.`,
    );
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    // Toujours fermer la connexion Prisma en fin de script
    await prisma.$disconnect();
  }
}

cleanupOrphanImages();
