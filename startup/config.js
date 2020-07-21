const config = require("config");
const morgan = require("morgan");
const env = process.env.NODE_ENV;
process.env.PORT = config.get("port");
if (env === "dev" || env === "debug") process.env.DEBUG = config.get("debug");
const debug = require("debug")("app:startup:config");

let jwtPrivateKey = config.get("jwtPrivateKey");

if (!jwtPrivateKey) {
  throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
}

module.exports = function (app) {
  if (env !== "prod") {
    if (env === "development") app.use(morgan("tiny"));
    else app.use(morgan("short"));
    debug("Morgan Enabled.");
  }
};
