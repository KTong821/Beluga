const request = require("supertest");
const { Model } = require("../../../schemas/model");
const { User } = require("../../../schemas/user");
const { Layer } = require("../../../schemas/layer");
const mongoose = require("mongoose");
const _ = require("lodash");
const axios = require("axios");
let server, token, user, model;

const post = async (req) => {
  return await request(server)
    .post("/api/models")
    .set("x-auth-token", token)
    .send(req);
};

const post_id = async (req, id) => {
  return await request(server)
    .post(`/api/models/${id}`)
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
    describe("POST /:id", () => {
      it("should return 200 response if flask server active", async () => {
        let res, addr;
        if (process.env.NODE_ENV === "debug")
          addr = "http://localhost:5000/healthcheck";
        else addr = "http://flask:80/healthcheck";
        res = await axios.get(addr, { timeout: 1000 });
        expect(res.status).toBe(200);
      });
      it("should return 200 response if request valid", async () => {
        const layer = await Layer.create({
          name: "dense",
          owner: mongoose.Types.ObjectId(),
          num: 3,
          isInput: false,
          isCustom: false,
        });
        const layer1 = await Layer.create({
          name: "dropout",
          owner: mongoose.Types.ObjectId(),
          num: 4,
          isInput: false,
          isCustom: false,
        });
        const { _id } = await Model.create({
          ...model,
          layers: [layer, layer1],
          owner: user._id,
        });

        user.models.push(_id);
        await user.save();
        let res;

        for (let type of ["docker", "h5", "script", "notebook"]) {
          res = await post_id({ type }, _id);
          expect(res.status).toBe(200);
          expect(res.text).toBe(_id.toString());
        }
      });
      it("should return 400 response if type missing", async () => {
        const res = await post_id(null, mongoose.Types.ObjectId());
        expect(res.status).toBe(400);
      });
      it("should return 400 response if type invalid", async () => {
        const res = await post_id({ type: "abc" }, mongoose.Types.ObjectId());
        expect(res.status).toBe(400);
      });
      it("should return 400 if ID is not listed under user's 'models' path", async () => {
        const { _id } = await Model.create({
          ...model,
          owner: mongoose.Types.ObjectId(),
        });
        const res = await post_id({ type: "h5" }, _id);
        expect(res.status).toBe(400);
      });
      it("should return 400 if model does not list user as owner", async () => {
        const { _id } = await Model.create({
          ...model,
          owner: mongoose.Types.ObjectId(),
        });
        user.models.push(_id);
        await user.save();
        const res = await post_id({ type: "h5" }, _id);
        expect(res.status).toBe(400);
      });
      it("should return 404 if the model does not exist", async () => {
        const _id = mongoose.Types.ObjectId();
        user.models.push(_id);
        await user.save();
        const res = await post_id({ type: "h5" }, _id);
        expect(res.status).toBe(404);
      });
    });
  });
});
