const config = require("config");
const jwt = require("jsonwebtoken");

const generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};
export default generateToken;
