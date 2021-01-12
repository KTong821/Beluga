const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

//winston logging -> file, console, NO MONGODB
module.exports = function () {
  winston.add(
    new winston.transports.File({
      filename: "./logs/beluga-errors.log",
      level: "error",
      handleRejections: true,
      handleExceptions: true,
    })
  );
  winston.addColors({
    error: "red",
    warn: "yellow",
    info: "blue",
    debug: "magenta",
  });
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: "info",
      colorize: true,
      prettyPrint: true,
      handleRejections: true,
      handleExceptions: true,
    })
  );
};
