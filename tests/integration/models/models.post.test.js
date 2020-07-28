const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const mongoose = require("mongoose");
const _ = require("lodash");
let server, token, user, model;

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
      let res, temp;
      for (let key in model) {
        temp = _.cloneDeep(model);
        temp[key] = undefined;
        res = await post(temp);
        expect(res.status).toBe(400);
      }
    });
    it("should return 400 if attributes invalid", async () => {
      let res, temp;
      const invalids = [
        { name: "a" },
        { name: "a".repeat(50) },
        { numLayers: 0 },
        { numLayers: 100 },
        { inputShape: [] },
        { inputShape: [1, 2, 3, 4] },
        { layers: [] },
        { layers: [1] },
      ];
      for (let invalid of invalids) {
        temp = { ..._.cloneDeep(model), invalid }; //invalid property overrides previously declared
        res = await post(temp);
        expect(res.status).toBe(400);
      }
    });
  });
});
