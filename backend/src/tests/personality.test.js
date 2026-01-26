import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const timestamp = Date.now();
const adminUser = {
  username: `PersoAdmin_${timestamp}`,
  email: `perso_admin_${timestamp}@test.com`,
  password: "password123",
  role: "ADMIN",
};

const samplePersonality = {
  name: "Napoleon Bonaparte",
  role: "Emperor",
  biography: "French military leader and emperor.",
  image: "napoleon.jpg",
  category: "VISIONARY",
};

let adminCookie;
let createdId;

describe("PERSONALITY ENDPOINTS", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: { ...adminUser, password: hashedPassword },
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminCookie = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({
      where: { email: adminUser.email },
    });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
    }
    if (createdId) {
      try {
        await prisma.personality.delete({ where: { id: createdId } });
      } catch (e) {}
    }
    await prisma.$disconnect();
  });

  describe("POST /personalities", () => {
    it("Should create a personality successfully", async () => {
      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .send(samplePersonality);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe(samplePersonality.name);
      expect(res.body.data.category).toBe("VISIONARY");
      createdId = res.body.data.id;
    });

    it("Should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .send({ name: "Incomplete" });
      expect(res.statusCode).toBe(400);
    });

    it("Should fail if not authenticated", async () => {
      const res = await request(app)
        .post("/personalities")
        .send(samplePersonality);
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });
  });

  describe("GET /personalities", () => {
    it("Should return all personalities", async () => {
      const res = await request(app).get("/personalities");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /personalities/:id", () => {
    it("Should return a specific personality", async () => {
      const res = await request(app).get(`/personalities/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdId);
    });

    it("Should return 404 for non-existent ID", async () => {
      const res = await request(app).get("/personalities/999999");
      expect(res.statusCode).toBe(404);
    });

    it("Should return 400 for invalid ID format", async () => {
      const res = await request(app).get("/personalities/abc");
      expect(res.statusCode).toBe(400);
    });
  });

  describe("PUT /personalities/:id", () => {
    it("Should update personality successfully", async () => {
      const res = await request(app)
        .put(`/personalities/${createdId}`)
        .set("Cookie", adminCookie)
        .send({
          role: "Exiled Emperor",
          category: "EXECUTIVE",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe("Exiled Emperor");
      expect(res.body.data.category).toBe("EXECUTIVE");
    });

    it("Should return 404 for non-existent ID", async () => {
      const res = await request(app)
        .put("/personalities/999999")
        .set("Cookie", adminCookie)
        .send({ name: "Ghost" });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /personalities/:id", () => {
    it("Should delete personality successfully", async () => {
      const res = await request(app)
        .delete(`/personalities/${createdId}`)
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
    });

    it("Should return 404 if already deleted", async () => {
      const res = await request(app)
        .delete(`/personalities/${createdId}`)
        .set("Cookie", adminCookie);
      expect(res.statusCode).toBe(404);
    });
  });
});
