import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

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
let commentId;

describe("COMMENT ENDPOINTS", () => {
  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existingUser) {
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: { ...testUser, password: hashedPassword },
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    userCookie = loginRes.headers["set-cookie"];

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
    it("Should create a comment successfully", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .set("Cookie", userCookie)
        .send({ content: "First comment!" });

      expect(res.statusCode).toBe(201);
      commentId = res.body.data.id;
    });

    it("Should fail if content is empty", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .set("Cookie", userCookie)
        .send({ content: "" });
      expect(res.statusCode).toBe(400);
    });

    it("Should fail if Event ID does not exist", async () => {
      const res = await request(app)
        .post(`/comments/event/999999`)
        .set("Cookie", userCookie)
        .send({ content: "Ghost" });
      expect(res.statusCode).toBe(404);
    });

    it("Should fail if not authenticated", async () => {
      const res = await request(app)
        .post(`/comments/event/${eventId}`)
        .send({ content: "Anon" });
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });
  });

  describe("GET /comments/event/:id", () => {
    it("Should get all comments for an event", async () => {
      const res = await request(app).get(`/comments/event/${eventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /comments/:id", () => {
    it("Should update own comment successfully", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Cookie", userCookie)
        .send({ content: "Updated content" });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.content).toBe("Updated content");
    });

    it("Should return 404 for non-existent comment", async () => {
      const res = await request(app)
        .put(`/comments/999999`)
        .set("Cookie", userCookie)
        .send({ content: "Ghost update" });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /comments/:id", () => {
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

      await prisma.comment.deleteMany({ where: { authorId: tempUser.id } });
      await prisma.event.deleteMany({ where: { authorId: tempUser.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it("Should return 404 when deleting deleted comment", async () => {
      const res = await request(app)
        .delete(`/comments/999999`)
        .set("Cookie", userCookie);
      expect(res.statusCode).toBe(404);
    });
  });
});
