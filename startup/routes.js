const express = require("express");
const helmet = require("helmet");
const models = require("../routes/models");
module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(helmet());
  app.use("/api/models", models);
};
