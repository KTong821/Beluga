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
      const { _id } = await Model.create({
        name: "test1",
        num: 10,
        owner: mongoose.Types.ObjectId(),
        isInput: false,
        isCustom: true,
        // lambda: "somewhere",
        options: {
          activation: "relu",
          strides: [2, 2],
        },
      });
      user.layers.push(_id);
      await user.save();
      const res = await get_id(_id);
      expect(res.status).toBe(400);
    });
    it("should return 404 if ID is listed under user's 'layers' path but does not exist", async () => {
      const _id = mongoose.Types.ObjectId();
      user.layers.push(_id);
      await user.save();
      const res = await get_id(_id);
      expect(res.status).toBe(404);
    });
  });
});

// describe("/api/layers", () => {
//   beforeEach(() => {
//     server = require("../../../index");
//   });
//   afterEach(async () => {
//     await Layer.deleteMany({});
//     server.close();
//   });
//   describe("GET /", () => {
//     it("should return all default and user layers", async () => {
//       await Layer.collection.insertMany([
//         {
//           name: "test1",
//           num: 10,
//           isInput: false,
//           isCustom: false,
//           options: {
//             activation: "relu",
//             strides: [2, 2],
//           },
//         },
//         {
//           name: "test2",
//           num: 5,
//           isInput: true,
//           inputShape: [20],
//           isCustom: false,
//           options: {
//             activation: "sigmoid",
//             pooling: [3, 3],
//           },
//         },
//       ]);
//       const res = await request(server).get("/api/layers");
//       expect(res.status).toBe(200);
//       expect(res.body.length).toBe(2);
//       expect(res.body[0]).toHaveProperty("name", "test1");
//       expect(res.body[0]).toHaveProperty("isInput", false);
//       expect(res.body[0]).toHaveProperty("options.activation", "relu");
//       expect(res.body[1]).toHaveProperty("name", "test2");
//       expect(res.body[1]).toHaveProperty("isInput", true);
//       expect(res.body[1]).toHaveProperty("inputShape", [20]);
//       expect(res.body[1]).toHaveProperty("options.activation", "sigmoid");
//     });
//     describe("GET /:id", () => {
//       it("should return 404 if invalid ID is given", async () => {
//         const res = await request(server).get("/api/layers/1");
//         expect(res.status).toBe(404);
//       });
//       it("should return 404 if valid ID is given but layer does not belong to non-admin user", async () => {
//         expect(1).toBe(1);
//       });
//       it("should return 404 if any valid ID is given and user is admin", async () => {
//         expect(1).toBe(1);
//       });
//       it("should return 404 if no layer with given valid ID exists", async () => {
//         const _id = mongoose.Types.ObjectId();
//         const res = await request(server).get(`/api/layers/${_id}`);
//         expect(res.status).toBe(404);
//       });
//     });
//   });
// });
