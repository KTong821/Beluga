module.exports = function (app) {
  require("./logging")();
  require("./config")(app);
  require("./routes")(app);
};
