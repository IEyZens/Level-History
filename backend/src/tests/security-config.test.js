import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import config from "../config/env.js";
import prisma from "../lib/prisma.js";

/**
 * Suite de tests A02 — Configuration de sécurité
 * Couvre : en-têtes HTTP, CORS, sécurité des cookies, validation de l'environnement
 */
describe("A02 - Security Configuration Tests", () => {
  let testUserId;
  let testUserCookie;

  // Timestamp unique pour éviter les conflits entre les runs de tests
  const timestamp = Date.now();
  const testUser = {
    username: `SecurityTest_${timestamp}`,
    email: `security_${timestamp}@test.com`,
    password: "Password123!",
  };

  beforeAll(async () => {
    // Créer l'utilisateur de test et récupérer son cookie de session
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

    const loginResponse = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    testUserCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  describe("Security Headers", () => {
    // Helmet doit injecter X-Content-Type-Options: nosniff
    it("Should have X-Content-Type-Options header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    // Helmet doit interdire l'intégration dans des iframes
    it("Should have X-Frame-Options header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["x-frame-options"]).toBe("DENY");
    });

    // La CSP doit être définie avec au moins default-src 'self'
    it("Should have Content-Security-Policy header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["content-security-policy"]).toBeDefined();
      expect(response.headers["content-security-policy"]).toContain(
        "default-src 'self'",
      );
    });

    // Referrer-Policy doit être présent
    it("Should have Referrer-Policy header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["referrer-policy"]).toBeDefined();
    });

    // Express ne doit pas exposer la stack technique via X-Powered-By
    it("Should NOT have X-Powered-By header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["x-powered-by"]).toBeUndefined();
    });

    // La pré-résolution DNS doit être désactivée
    it("Should have X-DNS-Prefetch-Control header", async () => {
      const response = await request(app).get("/events");
      expect(response.headers["x-dns-prefetch-control"]).toBe("off");
    });
  });

  describe("CORS Configuration", () => {
    // Les origines autorisées doivent recevoir l'en-tête CORS
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

    // Les credentials (cookies) doivent être autorisés cross-origin
    it("Should allow credentials", async () => {
      const allowedOrigin = config.ALLOWED_ORIGINS[0];

      const response = await request(app)
        .get("/events")
        .set("Origin", allowedOrigin);

      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    // La requête preflight OPTIONS doit être correctement gérée
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
    // Le cookie JWT ne doit pas être accessible via JavaScript
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

    // SameSite doit être Lax ou Strict pour limiter les attaques CSRF
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

    // Le flag Secure doit être présent uniquement en production
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
        // En dev/test, Secure dépend de la variable COOKIE_SECURE
        expect(cookieString.includes("Secure")).toBe(config.COOKIE_SECURE);
      }
    });

    // L'attribut Path doit être défini pour limiter la portée du cookie
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
    // Le port doit être dans la plage valide
    it("Should have valid PORT configuration", () => {
      expect(config.PORT).toBeGreaterThanOrEqual(1000);
      expect(config.PORT).toBeLessThanOrEqual(65535);
    });

    // NODE_ENV doit être une des trois valeurs autorisées
    it("Should have valid NODE_ENV", () => {
      expect(["development", "production", "test"]).toContain(config.NODE_ENV);
    });

    // JWT_SECRET doit avoir une longueur minimale de sécurité
    it("Should have JWT_SECRET with minimum length", () => {
      expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    // JWT_EXPIRES_IN doit respecter le format attendu (ex: 7d, 24h)
    it("Should have valid JWT_EXPIRES_IN format", () => {
      expect(config.JWT_EXPIRES_IN).toMatch(/^\d+[dhms]$/);
    });

    // ALLOWED_ORIGINS doit être un tableau non vide d'URLs valides
    it("Should have valid ALLOWED_ORIGINS array", () => {
      expect(Array.isArray(config.ALLOWED_ORIGINS)).toBe(true);
      expect(config.ALLOWED_ORIGINS.length).toBeGreaterThan(0);

      config.ALLOWED_ORIGINS.forEach((origin) => {
        expect(origin).toMatch(/^https?:\/\//);
      });
    });

    // DATABASE_URL doit pointer vers une base PostgreSQL
    it("Should have valid DATABASE_URL", () => {
      expect(config.DATABASE_URL).toMatch(/^postgresql:\/\//);
    });
  });

  describe("Security Best Practices", () => {
    // Les erreurs ne doivent pas exposer la stack trace en production
    it("Should not expose sensitive errors in production", async () => {
      const response = await request(app).get("/non-existent-route");

      expect(response.status).toBe(404);
      if (config.NODE_ENV === "production") {
        expect(response.body).not.toHaveProperty("stack");
      }
    });
  });
});
