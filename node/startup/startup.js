module.exports = function (app) {
  require("./logging")();
  require("./config")(app);
  require("./db")();
  require("./routes")(app);
};
