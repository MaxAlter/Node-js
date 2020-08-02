const Joi = require("@hapi/joi");
const bcryptjs = require("bcryptjs");
const usersModel = require("./users.model");
const jwt = require("jsonwebtoken");

require("dotenv").config();

class usersController {
  constructor() {
    this._costFactor = 4;
  }

  get registerNewUsers() {
    return this._registerNewUsers.bind(this);
  }
  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }

  async _getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      return res.json({ email: user.email, subscription: user.subscription });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  // регистраия нового юзера
  async _registerNewUsers(req, res, next) {
    try {
      const { email, password, subscription, token } = req.body;

      const existingUser = await usersModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).send("Email in use");
      }

      const passwordHash = await bcryptjs.hash(password, this._costFactor);
      const newUser = await usersModel.create({
        email,
        password: passwordHash,
        subscription,
        token,
      });

      return res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } catch (err) {
      next(err);
    }
  }
  //удаление токена
  async logout(req, res, next) {
    try {
      const user = req.user;
      await usersModel.updateToken(user._id, null);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
  //Аутентификация.
  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).send("Email or password is wrong");
      }

      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).send("Email or password is wrong");
      }

      const token = await jwt.sign(
        { id: user._id },
        process.env.JWT_SECRETKEY,
        {
          expiresIn: "30 days",
        }
      );
      await userModel.updateToken(user._id, token);
      return res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  }
  //авторизация
  async authorize(req, res, next) {
    try {
      const authHeader = req.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");

      let userId;
      const JWT_KEY = process.env.JWT_SECRETKEY;

      try {
        userId = await jwt.verify(token, JWT_KEY).id;
      } catch (err) {
        console.log(err);
      }
      const user = await usersModel.findById(userId);

      if (!user || user.token !== token)
        return res.status(401).send("Not Authorize");

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      console.log(err);
    }
  }
  async _getCurrentUser(req, res) {
    try {
      const { user } = req;

      res
        .status(200)
        .send({ email: user.email, subscription: user.subscription });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
  // валидация Аутентификации
  async validateSignIn(req, res, next) {
    try {
      const signInRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      const result = await Joi.validate(req.body, signInRules);

      next();
    } catch (err) {
      res.status(400).json({ message: "missing required field" });
    }
  }
  async validateRegisterNewUsers(req, res, next) {
    try {
      const createUserRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      const result = await Joi.validate(req.body, createUserRules);

      next();
    } catch (err) {
      res.status(400).json({ message: "missing required field" });
    }
  }
  async updateUser(req, res, next) {
    try {
      const user = req.user;

      const updatedUser = await usersModel.findUserByIdAndUpdate(user._id, {
        subscription: req.body.subscription,
      });

      if (!updatedUser) {
        return res.status(404).json("Not Found contact");
      }

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
  async validateUpdateUser(req, res, next) {
    try {
      const updateUserRules = Joi.object({
        subscription: Joi.string().only("free", "pro", "premium").required(),
      });

      const result = await Joi.validate(req.body, updateUserRules);

      next();
    } catch (err) {
      res.status(400).json({ message: "Value must be on of free/pro/premium" });
    }
  }
}

module.exports = new usersController();
