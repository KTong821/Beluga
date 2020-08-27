const express = require("express");
const app = express();
require("./startup/startup")(app);
const debug = require("debug")("app:index");

const port = process.env.PORT;

if (!["debug", "dev"].includes(process.env.NODE_ENV))
  app.listen(port, () => debug(`Listening on port ${port}.`));
module.exports = app;
