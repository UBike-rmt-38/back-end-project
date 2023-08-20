"use strict";

const { ValidationError } = require("sequelize");


function errorHandler(err, req, res, next) {
  let code = 500;
  let message = "Internal server error";
  console.log(err)

  if (err instanceof ValidationError) {
    code = 400;
    message = err.errors.map((e) => e.message);
  }

  switch (err.name) {
    case "ValidationError":
      code = 400;
      message = "Please enter username and password";
      break;
    case "UserNotFound":
    case "FailedLogin":
      code = 401;
      message = "Invalid login";
      break;
    case "NoToken":
      code = 401;
      message = "Access token is required";
      break;
    case "Unauthorized":
      code = 401;
      message = "Unauthorized";
      break;
    case "BicycleNotFound":
      code = 404;
      message = "Bicycle not found";
      break;
    case "MidtransError":
      code = 400;
      message = err.ApiResponse.error_messages[0];
    default:
      break;
  }
  res.status(code).json({ message });
}

module.exports = errorHandler;
