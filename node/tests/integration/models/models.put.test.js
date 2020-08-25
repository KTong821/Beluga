const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
const _ = require("lodash");
let server, token, user, model;

const put = async (req, id) => {
  return await request(server)
    .put(`/api/models/${id}`)
    .set("x-auth-token", token)
    .send(req);
};

describe("/api/models", () => {
  beforeAll(() => {
    server = require("../../../index");
  });
  beforeEach(async () => {
    user = new User({
      name: "Tester",
      email: "testing@beluga.ca",
      password: "Abcd1234",
    });
    token = user.generateAuthToken();
    model = {
      name: "test1",
      owner: user._id,
      numLayers: 3,
      inputShape: [1, 1, 1],
      layers: [mongoose.Types.ObjectId()],
    };
    const { _id } = await new Model(model).save();
    model["_id"] = _id;
    user.models.push(_id);
    user = await user.save();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Model.deleteMany({});
  });
  describe("PUT /", () => {
    it("should update the model if request is valid", async () => {
      model.name = "test2";
      const res = await put(_.omit(model, ["owner", "_id"]), model._id);
      expect(res.status).toBe(200);
      model = await Model.findById(res.body._id);
      expect(model).toHaveProperty("name", "test2");
      expect(model).toHaveProperty("owner", user._id);
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await put();
      expect(res.status).toBe(401);
    });
    it("should return 400 if ID is not listed under user's 'models' path", async () => {
      const res = await put(
        _.omit(model, ["owner", "_id"]),
        mongoose.Types.ObjectId()
      );
      expect(res.status).toBe(400);
    });
    it("should return 400 if model does not list user as owner", async () => {
      model.owner = mongoose.Types.ObjectId();
      await Model.findByIdAndUpdate(model._id, model);
      user.models.push(model._id);
      await user.save();
      const res = await put(_.omit(model, ["owner", "_id"]), model._id);
      expect(res.status).toBe(400);
    });
    it("should return 404 if ID is listed under user's 'models' path but does not exist", async () => {
      const _id = mongoose.Types.ObjectId();
      user.models.push(_id);
      await User.findByIdAndUpdate(user._id, user);
      const res = await put(_.omit(model, ["owner", "_id"]), _id);
      expect(res.status).toBe(404);
    });
  });
});
