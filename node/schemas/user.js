const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
  },
  models: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  layers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  isAdmin: { type: Boolean, default: false },
  confirmedEmail: { type: Boolean, default: false },
});

//generate JWT authentication
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

//custom password requirements for users
const complexityOptions = {
  min: 8,
  max: 25,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 0,
};

//Joi schema validation
function validate(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(10).max(50).required().email(),
  });
  return (
    schema.validate(user) &&
    passwordComplexity(complexityOptions, "Password").validate(user.password)
  );
}

module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validate = validate;
