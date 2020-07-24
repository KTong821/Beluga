const express = require("express");
const helmet = require("helmet");
const models = require("../routes/models");
const layers = require("../routes/layers");
module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(helmet());
  app.use("/api/models", models);
  app.use("/api/layers", layers);
};
