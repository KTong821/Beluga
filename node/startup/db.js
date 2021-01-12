const mongoose = require("mongoose");
const debug = require("debug")("app:startup:db");
const config = require("config");

//mongoDB setup
module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => debug(`Connected to MongoDB at ${db}`));
};
