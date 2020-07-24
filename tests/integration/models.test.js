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
      expect(res.body[0]).toHaveProperty("name", "numLayers", "inputShape");
      expect(res.body[0]).toHaveProperty("name", "numLayers", "inputShape");
    });
  });
});
