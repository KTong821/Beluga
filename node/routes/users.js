const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { User, validate } = require("../schemas/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");

//return list of users to admin
router.get("/users", admin, async (req, res) => {
  const users = await User.find().sort("name");
  res.send(users);
});

//retrieve information about user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//create new user
router.post("/", async (req, res) => {
  //validate request
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check for repeat accounts
  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send("A user with this email address has already been registered.");

  //encrypt passwords
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  //send selected properties
  res.send(_.pick(user, ["_id", "name", "email"]));
});

//TODO: put and delete endpoints
//TODO: cap user data limits

module.exports = router;
