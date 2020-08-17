const express = require("express");
const path = require("path");
const usersController = require("./users.controller");
const multer = require("multer");
const usersRouter = express.Router();

const storage = multer.diskStorage({
  destination: "tmp",
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });
// Регистрация нового ok
usersRouter.post(
  "/auth/register",
  usersController.registerNewUsers,
  usersController.validateRegisterNewUsers
);
// В модели User найти пользователя по email ok
usersRouter.post(
  "/auth/login",
  usersController.validateSignIn,
  usersController.signIn
);
//В модели User найти пользователя по _id. ok
usersRouter.post(
  "/auth/logout",
  usersController.authorize,
  usersController.logout
);
//Текущий - получить данные юзера по токену ok
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

usersRouter.patch(
  "/users/avatars",
  usersController.authorize,
  upload.single("avatar"),
  // usersController.minifyImage,
  usersController.updateUserAvatar
);
module.exports = usersRouter;
