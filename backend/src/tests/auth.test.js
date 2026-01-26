import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const authUser = {
  username: "AuthUser",
  email: "auth_test@test.com",
  password: "password123",
};

describe("AUTH ENDPOINTS", () => {
  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    if (existingUser) {
      await prisma.like.deleteMany({ where: { userId: existingUser.id } });
      await prisma.comment.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.event.deleteMany({ where: { authorId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
  });

  afterAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    });
    if (existingUser) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("Should register a new user successfully", async () => {
      const res = await request(app).post("/auth/register").send(authUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user).toHaveProperty("email", authUser.email);
    });

    it("Should fail if email is already taken", async () => {
      const res = await request(app).post("/auth/register").send(authUser);
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("Should login successfully", async () => {
      const res = await request(app).post("/auth/login").send({
        email: authUser.email,
        password: authUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("Should fail with wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: authUser.email,
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
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

    it("Should fail if not authenticated", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("Should logout successfully", async () => {
      const res = await request(app).post("/auth/logout");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });
});
