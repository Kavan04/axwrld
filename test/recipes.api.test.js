// @vitest-environment node
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../server.js";
import { Recipe } from "../models/recipeModel.js";

let mongo;
const app = createApp({ corsOrigins: ["http://localhost:3000"] });

const validRecipe = () => ({
  name: "Jollof rice",
  country: "Nigeria",
  prepTimeMinutes: 75,
  ingredients: ["rice", "tomato", "scotch bonnet"],
  steps: "Blend the peppers, fry the base, then simmer the rice in it.",
  location: { lat: 6.5244, lng: 3.3792 },
});

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri("axwrld-test"));
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await Recipe.deleteMany({});
});

describe("POST /recipes", () => {
  it("saves a valid recipe and returns 201 with it", async () => {
    const res = await request(app).post("/recipes").send(validRecipe());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      ...validRecipe(),
      id: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(res.body._id).toBeUndefined();

    const stored = await Recipe.findById(res.body.id).lean();
    expect(stored.ingredients).toEqual(["rice", "tomato", "scotch bonnet"]);
    expect(stored.location).toEqual({ lat: 6.5244, lng: 3.3792 });
  });

  it("normalises ingredient tags: trimmed, non-empty, de-duplicated case-insensitively", async () => {
    const res = await request(app)
      .post("/recipes")
      .send({
        ...validRecipe(),
        ingredients: ["  Rice ", "rice", "", "   ", "Tomato  paste", "TOMATO PASTE", "onion"],
      });

    expect(res.status).toBe(201);
    expect(res.body.ingredients).toEqual(["Rice", "Tomato paste", "onion"]);
    const stored = await Recipe.findById(res.body.id).lean();
    expect(stored.ingredients).toEqual(["Rice", "Tomato paste", "onion"]);
  });

  it("rejects an empty body and names every invalid field", async () => {
    const res = await request(app).post("/recipes").send({});

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields).sort()).toEqual(
      ["country", "ingredients", "location", "name", "prepTimeMinutes", "steps"].sort(),
    );
    expect(res.body.error).toMatch(/invalid fields: .*name/i);
    expect(await Recipe.countDocuments()).toBe(0);
  });

  it("rejects ingredients sent as one free-text string", async () => {
    const res = await request(app)
      .post("/recipes")
      .send({ ...validRecipe(), ingredients: "rice, tomato, onion" });

    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual({ ingredients: expect.stringMatching(/list/i) });
  });

  it("rejects ingredients that are empty after normalisation", async () => {
    const res = await request(app)
      .post("/recipes")
      .send({ ...validRecipe(), ingredients: ["  ", ""] });

    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty("ingredients");
  });

  it.each([
    ["latitude out of range", { lat: 91, lng: 0 }],
    ["longitude out of range", { lat: 0, lng: 181 }],
    ["missing longitude", { lat: 10 }],
    ["not an object", "Lagos"],
  ])("rejects a location with %s", async (_label, location) => {
    const res = await request(app).post("/recipes").send({ ...validRecipe(), location });

    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual({ location: expect.any(String) });
  });

  it.each([0, -5, 2.5, "soon", null, 20000])("rejects preparation time %s", async (prepTimeMinutes) => {
    const res = await request(app).post("/recipes").send({ ...validRecipe(), prepTimeMinutes });

    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual({ prepTimeMinutes: expect.any(String) });
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/recipes")
      .set("Content-Type", "application/json")
      .send('{"name": ');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/json/i);
  });
});

describe("GET /recipes", () => {
  it("lists saved recipes for the map, newest first", async () => {
    await request(app).post("/recipes").send(validRecipe()).expect(201);
    await request(app)
      .post("/recipes")
      .send({ ...validRecipe(), name: "Pho", country: "Vietnam", location: { lat: 21.03, lng: 105.85 } })
      .expect(201);

    const res = await request(app).get("/recipes");

    expect(res.status).toBe(200);
    expect(res.body.map((recipe) => recipe.name)).toEqual(["Pho", "Jollof rice"]);
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      country: "Vietnam",
      prepTimeMinutes: 75,
      ingredients: ["rice", "tomato", "scotch bonnet"],
      location: { lat: 21.03, lng: 105.85 },
    });
  });

  it("returns an empty list when nothing is saved", async () => {
    const res = await request(app).get("/recipes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("allows the frontend dev origin through CORS", async () => {
    const res = await request(app).get("/recipes").set("Origin", "http://localhost:3000");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("does not allow other origins through CORS", async () => {
    const res = await request(app).get("/recipes").set("Origin", "https://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
