import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const adminUser = {
  username: "EventAdmin",
  email: "event_admin@test.com",
  password: "password123",
  role: "ADMIN",
};

const sampleEvent = {
  title: "Ancient History",
  description: "Discovery of fire.",
  date: "1990-01-01T00:00:00.000Z",
};

let adminCookie;
let createdEventId;

describe("EVENT ENDPOINTS", () => {
  beforeAll(async () => {
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: adminUser.email } });

    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    adminCookie = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    await prisma.$disconnect();
  });

  // 1. CREATE
  describe("POST /events", () => {
    it("Should fail if not authenticated", async () => {
      const res = await request(app).post("/events").send(sampleEvent);
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });

    it("Should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/events")
        .set("Cookie", adminCookie)
        .send({ description: "No title here" });

      expect(res.statusCode).toBe(400);
    });

    it("Should create an event successfully (Admin)", async () => {
      const res = await request(app)
        .post("/events")
        .set("Cookie", adminCookie)
        .send(sampleEvent);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("status", "success");

      const eventData = res.body.data.event;
      expect(eventData).toHaveProperty("id");
      expect(eventData.title).toBe(sampleEvent.title);

      createdEventId = eventData.id;
    });
  });

  // 2. GET ALL
  describe("GET /events", () => {
    it("Should return a list of events", async () => {
      const res = await request(app).get("/events");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // 3. GET ONE
  describe("GET /events/:id", () => {
    it("Should return a specific event by ID", async () => {
      const res = await request(app).get(`/events/${createdEventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdEventId);
    });

    it("Should return 404 for non-existent ID", async () => {
      const res = await request(app).get(`/events/999999`);
      expect(res.statusCode).toBe(404);
    });
  });

  // 4. UPDATE
  describe("PUT /events/:id", () => {
    it("Should update an event successfully", async () => {
      const updatedData = {
        title: "Updated History",
        date: "2025-01-01T00:00:00.000Z",
      };

      const res = await request(app)
        .put(`/events/${createdEventId}`)
        .set("Cookie", adminCookie)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe(updatedData.title);
    });

    it("Should return 404 when updating non-existent ID", async () => {
      const res = await request(app)
        .put(`/events/999999`)
        .set("Cookie", adminCookie)
        .send({ title: "New" });

      expect(res.statusCode).toBe(404);
    });
  });

  // 5. DELETE
  describe("DELETE /events/:id", () => {
    it("Should delete an event successfully", async () => {
      const res = await request(app)
        .delete(`/events/${createdEventId}`)
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
    });

    it("Should return 404 when deleting non-existent ID", async () => {
      const res = await request(app)
        .delete(`/events/${createdEventId}`)
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(404);
    });
  });
});
