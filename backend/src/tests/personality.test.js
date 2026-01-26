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

let adminCookie;
let createdId;

describe("PERSONALITY ENDPOINTS (WITH UPLOAD)", () => {
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
    it("Should create a personality with image successfully", async () => {
      const fakeImageBuffer = Buffer.from("fake-image-content");

      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .attach("image", fakeImageBuffer, "napoleon_test.jpg")
        .field("name", "Napoleon Bonaparte")
        .field("role", "Emperor")
        .field("biography", "French military leader.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe("Napoleon Bonaparte");
      expect(res.body.data.image).toContain("/uploads/");

      createdId = res.body.data.id;
    });

    it("Should fail if image is missing", async () => {
      const res = await request(app)
        .post("/personalities")
        .set("Cookie", adminCookie)
        .field("name", "No Image Man")
        .field("biography", "I have no face.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Image file is required");
    });
  });

  describe("PUT /personalities/:id", () => {
    it("Should update personality and image successfully", async () => {
      const newFakeImage = Buffer.from("new-fake-image-content");

      const res = await request(app)
        .put(`/personalities/${createdId}`)
        .set("Cookie", adminCookie)
        .attach("image", newFakeImage, "napoleon_exiled.jpg")
        .field("role", "Exiled Emperor")
        .field("name", "Napoleon Bonaparte")
        .field("biography", "French military leader.")
        .field("category", "VISIONARY");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe("Exiled Emperor");
      expect(res.body.data.image).toContain("/uploads/");
    });
  });

  describe("DELETE /personalities/:id", () => {
    it("Should delete personality successfully", async () => {
      const res = await request(app)
        .delete(`/personalities/${createdId}`)
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
    });
  });
});
