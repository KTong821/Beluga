const express = require("express");
const app = express();
require("./startup/startup")(app);
const debug = require("debug")("app:index");

const port = process.env.PORT;
app.listen(port, () => debug(`Listening on port ${port}.`));
