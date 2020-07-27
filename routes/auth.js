const express = require("express");
const Joi = require("joi");
const router = express.Router();
const mongoose = require("mongoose");
const { User } = require("../schemas/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  //valid login information
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //validating email (checking if email exists in database)
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  //validating password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  //checking if they confirmed their email
  // if (!user.confirmedEmail) return res.status(403).send("Please confirm your email address");

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send("Logged in");
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });
  return schema.validate(req);
}

module.exports = router;
