const request = require("supertest");
const { Layer } = require("../../../schemas/layer");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require("fs-extra"); //treat paths as though they start from pwd of index.js
let server, token, user, layer;

const post = async (req) => {
  return await request(server)
    .post("/api/layers")
    .set("x-auth-token", token)
    .send(req);
};

const post_file = async (layer, path) => {
  return await request(server)
    .post("/api/layers")
    .set("x-auth-token", token)
    .field("layer", JSON.stringify(layer))
    .attach("module", path);
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
    layer = {
      name: "dense",
      num: 3,
      isInput: false,
      isCustom: false,
    };
  });
  afterEach(async () => {
    server.close();
    await User.deleteMany({});
    await Layer.deleteMany({});
    await fs.emptyDir("./uploads");
  });
  describe("POST /", () => {
    it("should save the layer if request is valid > no file, isCustom false", async () => {
      const res = await post(layer);
      expect(res.status).toBe(200);
      layer = await Layer.findById(res.body._id);
      expect(layer).toHaveProperty("name", "dense");
      expect(layer).toHaveProperty("owner", user._id);
      user = await User.findById(user._id);
      expect(user.layers).toContainEqual(layer._id);
    });
    it("should save the layer and file if request is valid > yes file, isCustom true", async () => {
      layer.isCustom = true;
      layer.name = "something";
      const res = await post_file(layer, "./tests/files/test.py");
      expect(res.status).toBe(200);
      layer = await Layer.findById(res.body._id);
      expect(layer).toHaveProperty("name", "something");
      expect(layer).toHaveProperty("owner", user._id);
      user = await User.findById(user._id);
      expect(user.layers).toContainEqual(layer._id);
      expect(res.header.warning).toBe(undefined);
      expect(fs.existsSync(`./uploads/${user._id}/test.py`)).toBe(true);
    });
    it("should save the layer but not file if request is valid > yes file, isCustom false", async () => {
      const res = await post_file(layer, "./tests/files/test.py");
      expect(res.status).toBe(200);
      layer = await Layer.findById(res.body._id);
      expect(layer).toHaveProperty("name", "dense");
      expect(layer).toHaveProperty("owner", user._id);
      user = await User.findById(user._id);
      expect(user.layers).toContainEqual(layer._id);
      expect(res.header.warning).not.toBe(undefined);
      expect(fs.existsSync(`./uploads/${user._id}/test.py`)).toBe(false);
    });
    it("should return 400 if request invalid > no file, isCustom true", async () => {
      layer.isCustom = true;
      const res = await post();
      expect(res.status).toBe(400);
    });
    it("should return 400 if request invalid > wrong file type, isCustom true", async () => {
      layer.isCustom = true;
      const res = await post_file(layer, "./tests/files/test.txt");
      expect(res.status).toBe(400);
      user = await User.findById(user._id);
      expect(user.layers).toHaveLength(0);
      expect(fs.existsSync(`./uploads/${user._id}/test.txt`)).toBe(false);
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await post(layer);
      expect(res.status).toBe(401);
    });
    it("should return 400 if isInput true but inputShape missing", async () => {
      layer.isInput = true;
      const res = await post(layer);
      expect(res.status).toBe(400);
    });
    it("should return 400 if isCustom true but name belongs to defaults", async () => {
      layer.name = "dense";
      layer.isCustom = true;
      const res = await post_file(layer, "./tests/files/test.py");
      expect(res.status).toBe(400);
      expect(fs.existsSync(`./uploads/${user._id}/test.py`)).toBe(false);
    });
    it("should return 400 if isCustom false but name does not belong to defaults", async () => {
      layer.name = "abcde";
      layer.isCustom = false;
      const res = await post_file(layer, "./tests/files/test.py");
      expect(res.status).toBe(400);
      expect(fs.existsSync(`./uploads/${user._id}/test.py`)).toBe(false);
    });
  });
});
