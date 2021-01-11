const express = require("express");
const router = express.Router();
const { User } = require("../schemas/user");
const bcrypt = require("bcrypt");
const validate = require("../schemas/auth");
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
  if (!user.confirmedEmail)
    return res.status(403).send("Please confirm your email address");

  //return generated JWT
  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send("Logged in");
});

module.exports = router;
