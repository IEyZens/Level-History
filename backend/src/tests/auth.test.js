import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

/**
 * Suite de tests — Endpoints d'authentification
 * Couvre : inscription, connexion, récupération du profil, déconnexion
 */
describe("AUTH ENDPOINTS", () => {
  // Utilisateur de test partagé entre les suites
  const authUser = {
    username: "AuthUser",
    email: "auth_test@test.com",
    password: "password123",
  };

  beforeAll(async () => {
    // Supprimer l'utilisateur de test s'il existe déjà (run précédent)
    const existingUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    if (existingUser) {
      // Supprimer les données liées avant l'utilisateur (contraintes FK)
      await prisma.like.deleteMany({ where: { userId: existingUser.id } });
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
  });

  afterAll(async () => {
    // Nettoyage de l'utilisateur créé pendant les tests
    const existingUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    if (existingUser) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    // Inscription réussie d'un nouvel utilisateur
    it("Should register a new user successfully", async () => {
      const res = await request(app).post("/auth/register").send(authUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user).toHaveProperty("email", authUser.email);
    });

    // L'email est déjà utilisé → 400
    it("Should fail if email is already taken", async () => {
      const res = await request(app).post("/auth/register").send(authUser);
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    // Connexion réussie — vérifie la présence du cookie de session
    it("Should login successfully", async () => {
      const res = await request(app).post("/auth/login").send({
        email: authUser.email,
        password: authUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    // Mauvais mot de passe → 401
    it("Should fail with wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: authUser.email,
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    // Utilisateur authentifié — retourne les infos du profil
    it("Should return user info if authenticated", async () => {
      const loginRes = await request(app).post("/auth/login").send({
        email: authUser.email,
        password: authUser.password,
      });
      const cookie = loginRes.headers["set-cookie"];

      const res = await request(app).get("/auth/me").set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(authUser.email);
    });

    // Requête sans cookie → 401
    it("Should fail if not authenticated", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    // Déconnexion réussie — pas besoin d'être authentifié
    it("Should logout successfully", async () => {
      const res = await request(app).post("/auth/logout");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });
});
