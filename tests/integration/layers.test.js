const request = require("supertest");
const { Layer } = require("../../schemas/layer");
const mongoose = require("mongoose");
let server;

describe("/api/layers", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Layer.deleteMany({});
    server.close();
  });
  describe("GET /", () => {
    it("should return all default and user layers", async () => {
      await Layer.collection.insertMany([
        {
          name: "test1",
          num: 10,
          isInput: false,
          isCustom: false,
          options: {
            activation: "relu",
            strides: [2, 2],
          },
        },
        {
          name: "test2",
          num: 5,
          isInput: true,
          inputShape: [20],
          isCustom: false,
          options: {
            activation: "sigmoid",
            pooling: [3, 3],
          },
        },
      ]);
      const res = await request(server).get("/api/layers");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty("name", "test1");
      expect(res.body[0]).toHaveProperty("isInput", false);
      expect(res.body[0]).toHaveProperty("options.activation", "relu");
      expect(res.body[1]).toHaveProperty("name", "test2");
      expect(res.body[1]).toHaveProperty("isInput", true);
      expect(res.body[1]).toHaveProperty("inputShape", [20]);
      expect(res.body[1]).toHaveProperty("options.activation", "sigmoid");
    });
  });
});
