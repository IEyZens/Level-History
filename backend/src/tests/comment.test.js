import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

/**
 * Suite de tests — Endpoints des commentaires
 * Couvre : création, lecture, modification et suppression de commentaires
 */
describe("COMMENT ENDPOINTS", () => {
  const testUser = {
    username: "CommenterUser",
    email: "commenter@test.com",
    password: "password123",
    role: "USER",
  };

  const testEvent = {
    title: "Event for Comments",
    description: "Discussing history.",
    date: "1900-01-01T00:00:00.000Z",
  };

  let userCookie;
  let eventId;
  let userId;

  beforeAll(async () => {
    // Supprimer l'utilisateur de test s'il existe déjà (run précédent)
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existingUser) {
      // Supprimer les données liées avant l'utilisateur (contraintes FK)
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: { ...testUser, password: hashedPassword },
    });
    userId = user.id;

    // Authentifier l'utilisateur de test
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    userCookie = loginRes.headers["set-cookie"];

    // Créer un événement de test pour y attacher les commentaires
    const event = await prisma.event.create({
      data: {
        ...testEvent,
        date: new Date(testEvent.date),
        authorId: user.id,
      },
    });
    eventId = event.id;
  });

  afterAll(async () => {
    // Nettoyage dans l'ordre des contraintes de clé étrangère
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existingUser) {
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
  });

  describe("POST /comments/event/:id", () => {
    // Création réussie d'un commentaire
    it("Should create a comment successfully", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .set("Cookie", userCookie)
        .send({ content: "First comment!" });

      expect(res.statusCode).toBe(201);
    });

    // Contenu vide → 400
    it("Should fail if content is empty", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .set("Cookie", userCookie)
        .send({ content: "" });
      expect(res.statusCode).toBe(400);
    });

    // Événement inexistant → 404
    it("Should fail if Event ID does not exist", async () => {
      const res = await request(app)
        .post(`/comments/event/999999`)
        .set("Cookie", userCookie)
        .send({ content: "Ghost" });
      expect(res.statusCode).toBe(404);
    });

    // Requête sans cookie → 401
    it("Should fail if not authenticated", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .send({ content: "Anon" });
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });
  });

  describe("GET /comments/event/:id", () => {
    // Récupération de tous les commentaires d'un événement
    it("Should get all comments for an event", async () => {
      const res = await request(app).get(`/comments/event/${eventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /comments/:id", () => {
    // Modification réussie de son propre commentaire
    it("Should update own comment successfully", async () => {
      const tempComment = await prisma.comment.create({
        data: {
          content: "Original Content",
          eventId: eventId,
          authorId: userId,
        },
      });

      const res = await request(app)
        .put(`/comments/${tempComment.id}`)
        .set("Cookie", userCookie)
        .send({ content: "Updated content" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.content).toBe("Updated content");
    });

    // Commentaire inexistant → 404
    it("Should return 404 for non-existent comment", async () => {
      const res = await request(app)
        .put(`/comments/999999`)
        .set("Cookie", userCookie)
        .send({ content: "Ghost update" });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /comments/:id", () => {
    // Suppression réussie de son propre commentaire
    // Utilise un utilisateur isolé pour éviter les interférences avec les autres tests
    it("Should delete own comment successfully", async () => {
      const timestamp = Date.now();
      const uniqueEmail = `delete_iso_${timestamp}@test.com`;
      const uniqueUsername = `DelUser_${timestamp}`;

      const hashedPassword = await bcrypt.hash("password123", 10);

      const tempUser = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email: uniqueEmail,
          password: hashedPassword,
        },
      });

      const loginRes = await request(app).post("/auth/login").send({
        email: uniqueEmail,
        password: "password123",
      });
      const tempCookie = loginRes.headers["set-cookie"];

      const tempEvent = await prisma.event.create({
        data: {
          title: "Iso Event",
          description: "Iso Desc",
          date: new Date(),
          authorId: tempUser.id,
        },
      });

      const tempComment = await prisma.comment.create({
        data: {
          content: "To be deleted",
          eventId: tempEvent.id,
          authorId: tempUser.id,
        },
      });

      const res = await request(app)
        .delete(`/comments/${tempComment.id}`)
        .set("Cookie", tempCookie);

      expect(res.statusCode).toBe(200);

      // Nettoyage des données temporaires créées pour ce test
      await prisma.comment.deleteMany({ where: { authorId: tempUser.id } });
      await prisma.event.deleteMany({ where: { authorId: tempUser.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    // Commentaire déjà supprimé ou inexistant → 404
    it("Should return 404 when deleting deleted comment", async () => {
      const res = await request(app)
        .delete(`/comments/999999`)
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(404);
    });
  });
});
