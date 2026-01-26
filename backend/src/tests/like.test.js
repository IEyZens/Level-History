import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const testUser = {
  username: "LikerUser",
  email: "liker@test.com",
  password: "password123",
  role: "USER",
};

const testEvent = {
  title: "Event to Like",
  description: "Click the thumb.",
  date: "1950-01-01T00:00:00.000Z",
};

let userCookie;
let eventId;
let commentId;

describe("LIKE ENDPOINTS", () => {
  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existingUser) {
      await prisma.like.deleteMany({ where: { userId: existingUser.id } });
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

    const comment = await prisma.comment.create({
      data: {
        content: "Please like me",
        eventId: event.id,
        authorId: user.id,
      },
    });
    commentId = comment.id;
  });

  afterAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (existingUser) {
      await prisma.like.deleteMany({ where: { userId: existingUser.id } });
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
    await prisma.$disconnect();
  });

  describe("POST /likes/:type/:id", () => {
    it("Should like an event successfully (First call)", async () => {
      const res = await request(app)
        .post(`/likes/event/${eventId}`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "event liked successfully");
    });

    it("Should unlike an event successfully (Second call)", async () => {
      const res = await request(app)
        .post(`/likes/event/${eventId}`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "event unliked successfully");
    });

    it("Should like a comment successfully", async () => {
      const res = await request(app)
        .post(`/likes/comment/${commentId}`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "comment liked successfully");
    });

    it("Should fail with invalid type", async () => {
      const res = await request(app)
        .post(`/likes/article/${eventId}`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Invalid like type. Must be 'event' or 'comment'.",
      );
    });

    it("Should fail with invalid ID format", async () => {
      const res = await request(app)
        .post(`/likes/event/invalid-id`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid ID format");
    });

    it("Should return 404 if target does not exist", async () => {
      const res = await request(app)
        .post(`/likes/event/999999`)
        .set("Cookie", userCookie);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "event not found");
    });

    it("Should fail if not authenticated", async () => {
      const res = await request(app).post(`/likes/event/${eventId}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });
  });
});
