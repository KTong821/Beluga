const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
const _ = require("lodash");
let server, token, user, model;

console.log(process.env.NODE_ENV);
const post = async (req) => {
  return await request(server)
    .post("/api/models")
    .set("x-auth-token", token)
    .send(req);
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
    model = {
      name: "test1",
      numLayers: 3,
      inputShape: [1, 1, 1],
      layers: [mongoose.Types.ObjectId()],
    };
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Model.deleteMany({});
    server.close();
  });
  describe("POST /", () => {
    it("should save the model if request is valid", async () => {
      const res = await post(model);
      expect(res.status).toBe(200);
      model = await Model.findById(res.body._id);
      expect(model).toHaveProperty("name", "test1");
      expect(model).toHaveProperty("owner", user._id);
      user = await User.findById(user._id);
      expect(user.models).toContainEqual(model._id); //objectId is treated as object, so use .toContainEqual rather than .toContain
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await post();
      expect(res.status).toBe(401);
    });
    it("should return 400 if required attribute missing", async () => {
      let res = await post((_.cloneDeep(model)["name"] = undefined));
      expect(res.status).toBe(400);
      res = await post((_.cloneDeep(model)["numLayers"] = undefined));
      expect(res.status).toBe(400);
      res = await post((_.cloneDeep(model)["inputShape"] = undefined));
      expect(res.status).toBe(400);
      res = await post((_.cloneDeep(model)["layers"] = undefined));
      expect(res.status).toBe(400);
    });
  });
});
