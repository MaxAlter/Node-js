const Joi = require("@hapi/joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const contactsModel = require("./ContactsModel");

class ContactsController {
  //работатет получение всех контактов
  getAllContacts = async (req, res, next) => {
    try {
      const contacts = await contactsModel.find();

      return res.status(200).json(contacts);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };
  // работатет добавление контакта
  createNewContact = async (req, res, next) => {
    try {
      const newContact = await contactsModel.create(req.body);

      return res.status(201).json(newContact);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };
  // получения контакта по id работатет
  getContactsById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const targetContact = await contactsModel.findById(id);

      if (!targetContact) {
        return res.status(404).json({ message: "Not Found" });
      }

      return res.status(200).json(targetContact);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };

  updateContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedContact = await contactsModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );
      console.log(updatedContact);

      if (!updatedContact) {
        return res.status(404).json({ message: "Not Found" });
      }

      return res.status(204).json(updatedContact);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };
  //работате удаление контакта
  deleteContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteStatus = await contactsModel.findByIdAndDelete(id);

      if (!deleteStatus) {
        return res.status(404).json({ message: "Not found" });
      }

      return res.status(200).json({ message: "contact deleted" });
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };

  validateUpdateContact = async (req, res, next) => {
    try {
      if (req.body.length) {
        throw new Error("missing fields");
      }

      const schema = Joi.object({
        name: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
      });

      await schema.validateAsync(req.body);

      next();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  validateNewContact = async (req, res, next) => {
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        subscription: Joi.string().required(),
        password: Joi.string().required(),
        token: Joi.string().required(),
      });

      await schema.validateAsync(req.body);

      next();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  errorHandler = (res, err) => {
    return res.status(500).send({ message: err.message });
  };
}

module.exports = new ContactsController();
