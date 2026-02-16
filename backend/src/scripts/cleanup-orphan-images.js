import "dotenv/config"; // ← IMPORTANT : En premier !
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

// Obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanupOrphanImages() {
  try {
    console.log("Starting cleanup of orphan images...\n");

    // Récupérer toutes les images utilisées en base
    const personalities = await prisma.personality.findMany({
      select: { image: true },
    });

    const usedImages = personalities
      .filter((p) => p.image) // Filtrer les null
      .map((p) => path.basename(p.image));

    console.log(`Images in database: ${usedImages.length}`);

    // Lister tous les fichiers dans uploads/
    const uploadsDir = path.join(__dirname, "../../uploads");

    if (!fs.existsSync(uploadsDir)) {
      console.log("Uploads directory does not exist!");
      return;
    }

    const allFiles = fs.readdirSync(uploadsDir);
    console.log(`Files in uploads/: ${allFiles.length}`);

    // Trouver les orphelins
    const orphans = allFiles.filter((file) => {
      // Ignorer .gitkeep et dossiers
      if (file === ".gitkeep" || file === "test") return false;

      const filePath = path.join(uploadsDir, file);

      // Vérifier que c'est un fichier
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return false;
      } catch (error) {
        return false; // Fichier inaccessible
      }

      // C'est un orphelin si pas dans la base
      return !usedImages.includes(file);
    });

    console.log(`\nOrphan images found: ${orphans.length}\n`);

    if (orphans.length === 0) {
      console.log("No orphan images to delete!");
      return;
    }

    // Afficher la liste des orphelins
    console.log("Files to delete:");
    orphans.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    // Supprimer les orphelins
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
    await prisma.$disconnect();
  }
}

cleanupOrphanImages();
