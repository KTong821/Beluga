const request = require("supertest");
const { Layer, defaults } = require("../../../schemas/layer");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
let server;

const get = async (endpoint) => {
  return request(server)
    .get(`/api/layers/${endpoint}`)
    .set("x-auth-token", token);
};

describe("/api/layers", () => {
  beforeEach(async () => {
    server = require("../../../index");
    user = new User({
      name: "Tester",
      email: "testing@beluga.ca",
      password: "Abcd1234",
    });
    user = await user.save();
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Layer.deleteMany({});
    server.close();
  });
  describe("GET /defaults", () => {
    it("should return an array of default layer names", async () => {
      token = "";
      const res = await get("");
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(defaults);
    });
  });
  describe("GET /custom", () => {
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await get("custom");
      expect(res.status).toBe(401);
    });
    it("should return all of the user's custom layers", async () => {
      const docs = await Layer.insertMany([
        {
          name: "dense",
          owner: user._id,
          isCustom: false,
          isInput: true,
          num: 2,
          inputShape: [5, 5, 5],
        },
        {
          name: "test2",
          owner: user._id,
          isCustom: true,
          isInput: false,
          num: 2,
          lambda: "somewhere",
        },
      ]);
      user.layers.push(docs[0]["_id"], docs[1]["_id"]);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get("custom");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty("name", "test2");
      expect(res.body[0]).toHaveProperty("num", 2);
      expect(res.body[0]).toHaveProperty("isCustom", true);
    });
  });
  describe("GET /:id", () => {
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await get(123);
      expect(res.status).toBe(401);
    });
    it("should return 404 if invalid ID is given", async () => {
      const res = await get(123);
      expect(res.status).toBe(404);
    });
    it("should return a single layer if valid ID is given", async () => {
      const { _id } = await Layer.create({
        name: "dense",
        owner: user._id,
        isCustom: false,
        isInput: false,
        num: 2,
        options: {
          activation: "tanh",
        },
      });
      user.layers.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get(_id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "dense");
      expect(res.body).toHaveProperty("num", 2);
      expect(res.body).toHaveProperty("options.activation", "tanh");
    });

    it("should return 400 if ID is not listed under user's 'layers' path", async () => {
      const _id = mongoose.Types.ObjectId();
      const res = await get(_id);
      expect(res.status).toBe(400);
    });
    it("should return 400 if layer does not list user as owner", async () => {
      const { _id } = await Layer.create({
        name: "test1",
        num: 10,
        owner: mongoose.Types.ObjectId(),
        isInput: false,
        isCustom: true,
        lambda: "somewhere",
        options: {
          activation: "relu",
          strides: [2, 2],
        },
      });
      user.layers.push(_id);
      await user.save();
      const res = await get(_id);
      expect(res.status).toBe(400);
    });
    it("should return 404 if ID is listed under user's 'layers' path but does not exist", async () => {
      const _id = mongoose.Types.ObjectId();
      user.layers.push(_id);
      await user.save();
      const res = await get(_id);
      expect(res.status).toBe(404);
    });
  });
});
