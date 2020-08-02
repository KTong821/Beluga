const express = require("express");
const helmet = require("helmet");
const models = require("../routes/models");
const layers = require("../routes/layers");
const users = require("../routes/users");
const auth = require("../routes/auth");
const error = require("../middleware/error");
module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(helmet());
  app.use("/api/models", models);
  app.use("/api/layers", layers);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use(error);
};
