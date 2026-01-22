import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const validUser = {
  username: "UltimateTester",
  email: "ultimate@test.com",
  password: "SecurePassword123!",
};

const secondUser = {
  username: "SecondUser",
  email: "second@test.com",
  password: "Password123!",
};

describe("AUTHENTICATION SUITE", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [validUser.email, secondUser.email] },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [validUser.email, secondUser.email] },
      },
    });
    await prisma.$disconnect();
  });

  // ===========================================================================
  // 1. REGISTER TESTS
  // ===========================================================================
  describe("POST /auth/register", () => {
    it("Should register a new user with valid data", async () => {
      const res = await request(app).post("/auth/register").send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user).toHaveProperty("email", validUser.email);
      expect(res.body.data.user).toHaveProperty("username", validUser.username);
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("Should fail if Email is already taken", async () => {
      const res = await request(app).post("/auth/register").send(validUser);

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("Should fail if Username is already taken", async () => {
      const duplicateUsernameUser = {
        ...secondUser,
        username: validUser.username,
      };

      const res = await request(app)
        .post("/auth/register")
        .send(duplicateUsernameUser);
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("Should fail if required fields are missing", async () => {
      const incompleteUser = { username: "NoEmailGuy", password: "123" };

      const res = await request(app)
        .post("/auth/register")
        .send(incompleteUser);
      expect(res.statusCode).toBe(400);
    });

    it("Should fail with empty strings", async () => {
      const emptyUser = { username: "", email: "", password: "" };

      const res = await request(app).post("/auth/register").send(emptyUser);
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  // ===========================================================================
  // 2. LOGIN TESTS
  // ===========================================================================
  describe("POST /auth/login", () => {
    it("Should login successfully with correct credentials", async () => {
      const res = await request(app).post("/auth/login").send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "success");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/jwt=.+/);
      expect(cookies[0]).toMatch(/HttpOnly/);
    });

    it("Should fail with wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: validUser.email,
        password: "WrongPassword!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("Should fail with non-existent email", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "ghost@doesnotexist.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
    });

    it("Should fail if fields are missing", async () => {
      const res = await request(app).post("/auth/login").send({
        email: validUser.email,
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("Should resist simple Injection attempts", async () => {
      const res = await request(app).post("/auth/login").send({
        email: validUser.email,
        password: "' OR '1'='1",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ===========================================================================
  // 3. LOGOUT TESTS
  // ===========================================================================
  describe("POST /auth/logout", () => {
    it("Should logout and clear cookie", async () => {
      const res = await request(app).post("/auth/logout");

      expect(res.statusCode).toBe(200);

      const cookies = res.headers["set-cookie"][0];
      const isCookieCleared =
        cookies.includes("Max-Age=0") || cookies.includes("Expires=");
      expect(isCookieCleared).toBe(true);
    });
  });
});
