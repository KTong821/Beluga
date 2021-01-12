const winston = require("winston");

//for handling all exceptions caught in express chain
module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).send("Internal Server Error.");
};
