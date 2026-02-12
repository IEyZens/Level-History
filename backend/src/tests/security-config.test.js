import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import config from "../config/env.js";
import prisma from "../lib/prisma.js";

describe("A02 - Security Configuration Tests", () => {
  let testUserId;
  let testUserCookie;

  const timestamp = Date.now();
  const testUser = {
    username: `SecurityTest_${timestamp}`,
    email: `security_${timestamp}@test.com`,
    password: "Password123!",
  };

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const createdUser = await prisma.user.create({
      data: {
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        role: "USER",
      },
    });
    testUserId = createdUser.id;

    // Login to get cookie
    const loginResponse = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    testUserCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe("Security Headers", () => {
    it("Should have X-Content-Type-Options header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("Should have X-Frame-Options header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["x-frame-options"]).toBe("DENY");
    });

    it("Should have Content-Security-Policy header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["content-security-policy"]).toBeDefined();
      expect(response.headers["content-security-policy"]).toContain(
        "default-src 'self'",
      );
    });

    it("Should have Referrer-Policy header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["referrer-policy"]).toBeDefined();
    });

    it("Should NOT have X-Powered-By header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["x-powered-by"]).toBeUndefined();
    });

    it("Should have X-DNS-Prefetch-Control header", async () => {
      const response = await request(app).get("/events");

      expect(response.headers["x-dns-prefetch-control"]).toBe("off");
    });
  });

  describe("CORS Configuration", () => {
    it("Should accept request from allowed origin", async () => {
      const allowedOrigin = config.ALLOWED_ORIGINS[0];

      const response = await request(app)
        .get("/events")
        .set("Origin", allowedOrigin);

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe(
        allowedOrigin,
      );
    });

    it("Should allow credentials", async () => {
      const allowedOrigin = config.ALLOWED_ORIGINS[0];

      const response = await request(app)
        .get("/events")
        .set("Origin", allowedOrigin);

      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("Should handle OPTIONS preflight request", async () => {
      const allowedOrigin = config.ALLOWED_ORIGINS[0];

      const response = await request(app)
        .options("/events")
        .set("Origin", allowedOrigin)
        .set("Access-Control-Request-Method", "POST");

      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-methods"]).toContain(
        "POST",
      );
    });
  });

  describe("Cookie Security", () => {
    it("JWT cookie should have httpOnly flag", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const setCookieHeader = response.headers["set-cookie"];
      expect(setCookieHeader).toBeDefined();

      const cookieString = Array.isArray(setCookieHeader)
        ? setCookieHeader[0]
        : setCookieHeader;

      expect(cookieString).toContain("HttpOnly");
    });

    it("JWT cookie should have sameSite attribute", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const setCookieHeader = response.headers["set-cookie"];
      const cookieString = Array.isArray(setCookieHeader)
        ? setCookieHeader[0]
        : setCookieHeader;

      expect(
        cookieString.includes("SameSite=Lax") ||
          cookieString.includes("SameSite=Strict"),
      ).toBe(true);
    });

    it("JWT cookie should have correct secure flag based on environment", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const setCookieHeader = response.headers["set-cookie"];
      const cookieString = Array.isArray(setCookieHeader)
        ? setCookieHeader[0]
        : setCookieHeader;

      if (config.NODE_ENV === "production") {
        expect(cookieString).toContain("Secure");
      } else {
        // In dev/test, Secure flag should not be present
        expect(cookieString.includes("Secure")).toBe(config.COOKIE_SECURE);
      }
    });

    it("JWT cookie should have Path attribute", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const setCookieHeader = response.headers["set-cookie"];
      const cookieString = Array.isArray(setCookieHeader)
        ? setCookieHeader[0]
        : setCookieHeader;

      expect(cookieString).toContain("Path=/");
    });
  });

  describe("Environment Validation", () => {
    it("Should have valid PORT configuration", () => {
      expect(config.PORT).toBeGreaterThanOrEqual(1000);
      expect(config.PORT).toBeLessThanOrEqual(65535);
    });

    it("Should have valid NODE_ENV", () => {
      expect(["development", "production", "test"]).toContain(config.NODE_ENV);
    });

    it("Should have JWT_SECRET with minimum length", () => {
      expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    it("Should have valid JWT_EXPIRES_IN format", () => {
      expect(config.JWT_EXPIRES_IN).toMatch(/^\d+[dhms]$/);
    });

    it("Should have valid ALLOWED_ORIGINS array", () => {
      expect(Array.isArray(config.ALLOWED_ORIGINS)).toBe(true);
      expect(config.ALLOWED_ORIGINS.length).toBeGreaterThan(0);

      config.ALLOWED_ORIGINS.forEach((origin) => {
        expect(origin).toMatch(/^https?:\/\//);
      });
    });

    it("Should have valid DATABASE_URL", () => {
      expect(config.DATABASE_URL).toMatch(/^postgresql:\/\//);
    });
  });

  describe("Security Best Practices", () => {
    it("Should not expose sensitive errors in production", async () => {
      // Try to access non-existent route
      const response = await request(app).get("/non-existent-route");

      // Should return generic error, not expose stack trace
      expect(response.status).toBe(404);
      if (config.NODE_ENV === "production") {
        expect(response.body).not.toHaveProperty("stack");
      }
    });
  });
});
