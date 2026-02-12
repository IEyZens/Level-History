import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js"; // ✅ Correction ici
import prisma from "../lib/prisma.js"; // ✅ Correction ici aussi

describe("A01 - Access Control Tests", () => {
  let normalUserCookie;
  let adminUserCookie;
  let otherUserCookie;
  let normalUserId;
  let adminUserId;
  let otherUserId;
  let testEvent;
  let normalUserComment;
  let otherUserComment;

  const timestamp = Date.now();

  const normalUser = {
    username: `NormalUser_${timestamp}`,
    email: `normal_${timestamp}@test.com`,
    password: "Password123!",
  };

  const adminUser = {
    username: `AdminUser_${timestamp}`,
    email: `admin_${timestamp}@test.com`,
    password: "Password123!",
  };

  const otherUser = {
    username: `OtherUser_${timestamp}`,
    email: `other_${timestamp}@test.com`,
    password: "Password123!",
  };

  beforeAll(async () => {
    // Nettoyer les utilisateurs existants
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [normalUser.email, adminUser.email, otherUser.email],
        },
      },
    });

    // Créer les utilisateurs de test
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    const createdNormalUser = await prisma.user.create({
      data: {
        username: normalUser.username,
        email: normalUser.email,
        password: hashedPassword,
        role: "USER",
      },
    });
    normalUserId = createdNormalUser.id;

    const createdAdminUser = await prisma.user.create({
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    adminUserId = createdAdminUser.id;

    const createdOtherUser = await prisma.user.create({
      data: {
        username: otherUser.username,
        email: otherUser.email,
        password: hashedPassword,
        role: "USER",
      },
    });
    otherUserId = createdOtherUser.id;

    // Se connecter avec chaque utilisateur
    const normalUserLogin = await request(app).post("/auth/login").send({
      email: normalUser.email,
      password: normalUser.password,
    });
    normalUserCookie = normalUserLogin.headers["set-cookie"];

    const adminUserLogin = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminUserCookie = adminUserLogin.headers["set-cookie"];

    const otherUserLogin = await request(app).post("/auth/login").send({
      email: otherUser.email,
      password: otherUser.password,
    });
    otherUserCookie = otherUserLogin.headers["set-cookie"];

    // Créer un événement de test (par l'admin)
    testEvent = await prisma.event.create({
      data: {
        title: "Test Event for Access Control",
        description: "Event used for testing access control",
        date: new Date("2000-01-01"),
        authorId: adminUserId,
      },
    });

    // Créer des commentaires de test
    normalUserComment = await prisma.comment.create({
      data: {
        content: "Comment by normal user",
        authorId: normalUserId,
        eventId: testEvent.id,
      },
    });

    otherUserComment = await prisma.comment.create({
      data: {
        content: "Comment by other user",
        authorId: otherUserId,
        eventId: testEvent.id,
      },
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.comment.deleteMany({
      where: {
        eventId: testEvent.id,
      },
    });

    await prisma.event.delete({
      where: { id: testEvent.id },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [normalUserId, adminUserId, otherUserId],
        },
      },
    });

    await prisma.$disconnect();
  });

  describe("Comment Ownership Tests", () => {
    it("Should allow user to update their own comment", async () => {
      const response = await request(app)
        .put(`/comments/${normalUserComment.id}`)
        .set("Cookie", normalUserCookie)
        .send({
          content: "Updated content by owner",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.content).toBe("Updated content by owner");
    });

    it("Should NOT allow user to update another user's comment", async () => {
      const response = await request(app)
        .put(`/comments/${otherUserComment.id}`)
        .set("Cookie", normalUserCookie)
        .send({
          content: "Trying to hack!",
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("permission");
    });

    it("Should allow admin to update any comment", async () => {
      const response = await request(app)
        .put(`/comments/${normalUserComment.id}`)
        .set("Cookie", adminUserCookie)
        .send({
          content: "Admin changed this",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.content).toBe("Admin changed this");
    });

    it("Should allow user to delete their own comment", async () => {
      // Créer un commentaire temporaire
      const tempComment = await prisma.comment.create({
        data: {
          content: "Temporary comment to delete",
          authorId: normalUserId,
          eventId: testEvent.id,
        },
      });

      const response = await request(app)
        .delete(`/comments/${tempComment.id}`)
        .set("Cookie", normalUserCookie);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted");

      // Vérifier que le commentaire n'existe plus
      const deletedComment = await prisma.comment.findUnique({
        where: { id: tempComment.id },
      });
      expect(deletedComment).toBeNull();
    });

    it("Should NOT allow user to delete another user's comment", async () => {
      const response = await request(app)
        .delete(`/comments/${otherUserComment.id}`)
        .set("Cookie", normalUserCookie);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it("Should allow admin to delete any comment", async () => {
      // Créer un commentaire temporaire
      const tempComment = await prisma.comment.create({
        data: {
          content: "Temporary comment for admin to delete",
          authorId: normalUserId,
          eventId: testEvent.id,
        },
      });

      const response = await request(app)
        .delete(`/comments/${tempComment.id}`)
        .set("Cookie", adminUserCookie);

      expect(response.status).toBe(200);

      // Vérifier que le commentaire n'existe plus
      const deletedComment = await prisma.comment.findUnique({
        where: { id: tempComment.id },
      });
      expect(deletedComment).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("Should return 400 for invalid comment ID", async () => {
      const response = await request(app)
        .put("/comments/invalid-id")
        .set("Cookie", normalUserCookie)
        .send({
          content: "Test content",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid ID");
    });

    it("Should return 401 for unauthenticated request", async () => {
      const response = await request(app)
        .put(`/comments/${normalUserComment.id}`)
        .send({
          content: "Trying without auth",
        });

      expect(response.status).toBe(401);
    });

    it("Should return 404 for non-existent comment", async () => {
      const response = await request(app)
        .put("/comments/999999")
        .set("Cookie", normalUserCookie)
        .send({
          content: "Test content",
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });
});
