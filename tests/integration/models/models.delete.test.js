const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
const _ = require("lodash");
let server, token, user, model;

const del = async (id) => {
  return await request(server)
    .delete(`/api/models/${id}`)
    .set("x-auth-token", token)
    .send();
};

describe("/api/models", () => {
  beforeEach(async () => {
    server = require("../../../index");
    user = new User({
      name: "Tester",
      email: "testing@beluga.ca",
      password: "Abcd1234",
    });
    token = user.generateAuthToken();
    model = await new Model({
      name: "test1",
      owner: user._id,
      numLayers: 3,
      inputShape: [1, 1, 1],
      layers: [mongoose.Types.ObjectId()],
    }).save();
    user.models.push(model._id);
    user = await user.save();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Model.deleteMany({});
    server.close();
  });
  describe("DELETE /", () => {
    it("should delete the model if request is valid", async () => {
      const res = await del(model._id);
      expect(res.status).toBe(200);
      model = await Model.findById(model._id);
      expect(model).toBe(null);
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await del();
      expect(res.status).toBe(401);
    });
    it("should return 400 if ID is not listed under user's 'model' path", async () => {
      const res = await del(mongoose.Types.ObjectId());
      expect(res.status).toBe(400);
    });
    it("should return 400 if model does not list user as owner", async () => {
      model.owner = mongoose.Types.ObjectId();
      model.save();
      user.models.push(model._id);
      await user.save();
      const res = await del(model._id);
      expect(res.status).toBe(400);
    });
    it("should return 404 if ID is listed under user's 'model' path but does not exist", async () => {
      const _id = mongoose.Types.ObjectId();
      user.models.push(_id);
      await user.save();
      const res = await del(_id);
      expect(res.status).toBe(404);
    });
  });
});
