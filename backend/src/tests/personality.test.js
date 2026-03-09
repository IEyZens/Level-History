import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

/**
 * Suite de tests — Endpoints des personnalités avec upload d'image
 * Couvre : création, modification et suppression avec gestion de fichier Multer
 */
describe("PERSONALITY ENDPOINTS (WITH UPLOAD)", () => {
  // Timestamp unique pour éviter les conflits entre les runs de tests
  const timestamp = Date.now();
  const adminUser = {
    username: `PersoAdmin_${timestamp}`,
    email: `perso_admin_${timestamp}@test.com`,
    password: "password123",
    role: "ADMIN",
  };

  let adminCookie;
  let createdId;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: { ...adminUser, password: hashedPassword },
    });

    // Authentifier l'admin et récupérer le cookie de session
    const loginRes = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminCookie = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    // Supprimer l'utilisateur admin de test
    const user = await prisma.user.findUnique({
      where: { email: adminUser.email },
    });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    // Supprimer la personnalité créée si elle n'a pas été supprimée pendant les tests
    if (createdId) {
      try {
        await prisma.personality.delete({ where: { id: createdId } });
      } catch (e) {
        // Déjà supprimée pendant les tests, on ignore l'erreur
      }
    }

    await prisma.$disconnect();
  });

  describe("POST /personalities", () => {
    // Création réussie avec upload d'une image (buffer simulé)
    it("Should create a personality with image successfully", async () => {
      const fakeImageBuffer = Buffer.from("fake-image-content");

      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .attach("image", fakeImageBuffer, "napoleon_test.jpg")
        .field("name", "Napoleon Bonaparte")
        .field("role", "Emperor")
        .field("biography", "French military leader.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe("Napoleon Bonaparte");
      expect(res.body.data.image).toContain("/uploads/");

      // Conserver l'ID pour les tests suivants
      createdId = res.body.data.id;
    });

    // Image absente → 400
    it("Should fail if image is missing", async () => {
      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .field("name", "No Image Man")
        .field("biography", "I have no face.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Image file is required");
    });
  });

  describe("PUT /personalities/:id", () => {
    // Modification réussie avec remplacement de l'image
    it("Should update personality and image successfully", async () => {
      const newFakeImage = Buffer.from("new-fake-image-content");

      const res = await request(app)
        .put(`/personalities/${createdId}`)
        .set("Cookie", adminCookie)
        .attach("image", newFakeImage, "napoleon_exiled.jpg")
        .field("role", "Exiled Emperor")
        .field("name", "Napoleon Bonaparte")
        .field("biography", "French military leader.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe("Exiled Emperor");
      expect(res.body.data.image).toContain("/uploads/");
    });
  });

  describe("DELETE /personalities/:id", () => {
    // Suppression réussie de la personnalité et de son image
    it("Should delete personality successfully", async () => {
      const res = await request(app)
        .delete(`/personalities/${createdId}`)
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
    });
  });
});
