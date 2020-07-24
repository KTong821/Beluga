const request = require("supertest");
const { Model } = require("../../schemas/model");
const mongoose = require("mongoose");
let server;

describe("/api/models", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Model.deleteMany({});
    server.close();
  });
  describe("GET /", () => {
    it("should return all models", async () => {
      await Model.collection.insertMany([
        {
          name: "test1",
          numLayers: 2,
          inputShape: [5, 5, 5],
        },
        {
          name: "test2",
          numLayers: 3,
          inputShape: [6, 6, 6],
        },
      ]);
      const res = await request(server).get("/api/models");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty("name", "test1");
      expect(res.body[0]).toHaveProperty("numLayers", 2);
      expect(res.body[0]).toHaveProperty("inputShape", [5, 5, 5]);
      expect(res.body[1]).toHaveProperty("name", "test2");
      expect(res.body[1]).toHaveProperty("numLayers", 3);
      expect(res.body[1]).toHaveProperty("inputShape", [6, 6, 6]);
    });
  });
  describe("GET /:id", () => {
    it("should return a single model if valid ID is given", async () => {
      const { _id } = await Model.create({
        name: "test1",
        numLayers: 2,
        inputShape: [5, 5, 5],
      });
      const res = await request(server).get(`/api/models/${_id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "name",
        "numLayers",
        "inputShape",
        "test1",
        [5, 5, 5]
      );
    });
    it("should return 404 if invalid ID is given", async () => {
      const res = await request(server).get("/api/models/1");
      expect(res.status).toBe(404);
    });
    it("should return 404 if no genre with given valid ID exists", async () => {
      const _id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/models/${_id}`);
      expect(res.status).toBe(404);
    });
  });
});
