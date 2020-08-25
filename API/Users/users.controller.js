const Joi = require("@hapi/joi");
// const { nanoid } = require("nanoid"); не работает выдает ошибу не правильного import
const fs = require("fs");
const path = require("path");
const shortid = require("shortid");
const { promises: fsPromises } = fs;
const Avatar = require("avatar-builder");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const bcryptjs = require("bcryptjs");
const usersModel = require("./users.model");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const Mailgen = require("mailgen");

require("dotenv").config();

class usersController {
  constructor() {
    this._costFactor = 6;
  }

  get registerNewUsers() {
    return this._registerNewUsers.bind(this);
  }
  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }
  get sendVerificationEmail() {
    return this._sendVerificationEmail.bind(this);
  }
  //
  async _getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      return res.json({
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async _registerNewUsers(req, res, next) {
    try {
      const avatar = await Avatar.male8bitBuilder(128);
      const buff = await avatar.create("gabriel");
      const fileName = Date.now() + ".png";
      const fileLink = `public/images/${fileName}`;
      await fsPromises.writeFile(fileLink, buff);

      const { email, password, subscription, token } = req.body;

      const existUser = await usersModel.findUserByEmail(email);
      if (existUser) {
        return res.status(409).send("Email in use");
      }

      const passwordHash = await bcryptjs.hash(password, this._costFactor);

      const verifyToken = shortid.generate();
      const option = {
        verifyToken,
        email,
      };
      await this.sendVerificationEmail(option);

      const newUser = await usersModel.create({
        email,
        avatarURL: `public/images/${fileName}`,
        password: passwordHash,
        subscription,
        verifyToken,
        token,
      });

      return res.status(201).json({
        id: newUser._id,
        avatarURL: newUser.avatarURL,
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

      const user = await usersModel.findUserByEmail(email);
      console.log(user);
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
          expiresIn: "100 days",
        }
      );
      await usersModel.updateToken(user._id, token);
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
  //получить данные юзера по токену
  async _getCurrentUser(req, res) {
    try {
      const { user } = req;

      res.status(200).send({
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
  // валидация Аутентификации
  async validateSignIn(req, res, next) {
    try {
      const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      await schema.validateAsync(req.body);

      next();
    } catch (err) {
      res.status(400).json({ message: "missing required field" });
    }
  }
  // валидация нового юзера
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
  // редактирование юзера по id
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
  async updateUserAvatar(req, res, next) {
    try {
      const user = req.user;

      const userAvatar = await usersModel.findById(user._id);
      try {
        await fsPromises.unlink(userAvatar.avatarURL);
      } catch (error) {
        console.log(error.message);
      }

      const updatedUser = await usersModel.findUserByIdAndUpdate(user._id, {
        avatarURL: req.file.path,
      });

      if (!updatedUser) {
        return res.status(404).json("Not Found contact");
      }

      return res.status(200).json({ avatarURL: updatedUser.avatarURL });
    } catch (err) {
      next(err);
    }
  }
  async minifyImage(req, res, next) {
    try {
      await imagemin([req.file.path], {
        destination: "public/images",
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });

      await fsPromises.unlink(req.file.path);

      req.file.path = path.join("public/images", req.file.filename);
      req.file.destination = "public/images";
      next();
    } catch (err) {
      res.status(400).json({ message: "Value must be file photo" });
    }
  }

  async _sendVerificationEmail({ verifyToken, email }) {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "GOiT HW-6",
        link: "http://localhost:3000/",
      },
    });
    const template = {
      body: {
        intro: "Welcome to my HW-6",
        action: {
          instructions: "please click here:",
          button: {
            color: "#22BC66",
            text: "Verify your account",
            link: `http://localhost:3000/verify/${verifyToken}`,
          },
        },
      },
    };
    const emailBody = mailGenerator.generate(template);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: "alter0075926@gmail.com",
      from: "alter0075926@gmail.com", // Use the email address or domain you verified above
      subject: "Sending with Twilio SendGrid is Fun",
      text: "verify account",
      html: emailBody,
    };
    await sgMail.send(msg).then(
      () => {},
      (error) => {
        console.error(error);

        if (error.res) {
          console.error(error.res.body);
        }
      }
    );
  }
  async verificationToken(req, res, next) {
    const { token } = req.params;
    const user = await usersModel.findOne({ verifyToken: token });
    if (!user) {
      return res.status(404).json({
        message: "Your verification token is not valid",
      });
    }
    await user.updateOne({ verify: true, verifyToken: null });
    res.status(200).json({ message: "verification successful" });
  }
}

module.exports = new usersController();
