const express = require("express");
const usersController = require("./users.controller");
const usersRouter = express.Router();

usersRouter.post(
  "/auth/register",
  usersController.registerNewUsers,
  usersController.validateRegisterNewUsers
);

usersRouter.post(
  "/auth/login",
  usersController.validateSignIn,
  usersController.signIn
);

usersRouter.post(
  "/auth/logout",
  usersController.authorize,
  usersController.logout
);
usersRouter.get(
  "/users/current",
  usersController.authorize,
  usersController.getCurrentUser
);
usersRouter.patch(
  "/users",
  usersController.authorize,
  usersController.validateUpdateUser,
  usersController.updateUser
);

module.exports = usersRouter;
