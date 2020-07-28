const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
let server, token, user;

const get = async () => {
  return request(server).get("/api/models").set("x-auth-token", token);
};
const get_id = async (id) => {
  return await request(server)
    .get(`/api/models/${id}`)
    .set("x-auth-token", token);
};

describe("/api/models", () => {
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
    await Model.deleteMany({});
    server.close();
  });
  describe("GET /", () => {
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await get();
      expect(res.status).toBe(401);
    });
    it("should omit models whose 'owner' property does not match user id", async () => {
      const { _id } = await Model.create({
        name: "failure",
        owner: mongoose.Types.ObjectId(),
        numLayers: 10,
        inputShape: [1, 2, 3],
        layers: [mongoose.Types.ObjectId()],
      });
      user.models.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
    it("should return all of the user's models", async () => {
      const docs = await Model.insertMany([
        {
          name: "test1",
          owner: user._id,
          numLayers: 2,
          inputShape: [5, 5, 5],
          layers: [mongoose.Types.ObjectId()],
        },
        {
          name: "test2",
          owner: user._id,
          numLayers: 3,
          inputShape: [6, 6, 6],
          layers: [mongoose.Types.ObjectId()],
        },
      ]);
      user.models.push(docs[0]["_id"], docs[1]["_id"]);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get();
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
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await get_id(123);
      expect(res.status).toBe(401);
    });
    it("should return a single model if valid ID is given", async () => {
      const { _id } = await Model.create({
        name: "test1",
        owner: user._id,
        numLayers: 2,
        inputShape: [5, 5, 5],
        layers: [mongoose.Types.ObjectId()],
      });
      user.models.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get_id(_id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "test1");
      expect(res.body).toHaveProperty("numLayers", 2);
      expect(res.body).toHaveProperty("inputShape", [5, 5, 5]);
    });
    it("should return 404 if invalid ID is given", async () => {
      const res = await get_id(123);
      expect(res.status).toBe(404);
    });
    it("should return 400 if ID is not listed under user's 'model' path", async () => {
      const _id = mongoose.Types.ObjectId();
      const res = await get_id(_id);
      expect(res.status).toBe(400);
    });
    it("should return 400 if model does not list user as owner", async () => {
      const { _id } = await Model.create({
        name: "test2",
        owner: mongoose.Types.ObjectId(),
        numLayers: 2,
        inputShape: [7, 7],
        layers: [mongoose.Types.ObjectId()],
      });
      user.models.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get_id(_id);
      expect(res.status).toBe(400);
    });
    it("should return 404 if ID is listed under user's 'model' path but does not exist", async () => {
      const _id = mongoose.Types.ObjectId();
      user.models.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await get_id(_id);
      expect(res.status).toBe(404);
    });
  });
});
