const Joi = require("@hapi/joi");

const contactsModel = require("../Model/ContactsModel");

class ContactsController {
  getAllContacts = async (req, res, next) => {
    try {
      const contacts = await contactsModel.listContacts();

      return res.status(200).json(contacts);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };

  createNewContact = async (req, res, next) => {
    try {
      const newContact = await contactsModel.addContact(req.body);

      return res.status(201).json(newContact);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };

  getContactsById = async (req, res, next) => {
    try {
      const { id } = req.params;
      // const id = parseInt(req.params.id)

      const targetContact = await contactsModel.getContactById(id);

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
      const updatedContact = await contactsModel.updateContact(
        req.params.id,
        req.body
      );

      if (!updatedContact) {
        return res.status(404).json({ message: "Not Found" });
      }

      return res.status(200).json(updatedContact);
    } catch (err) {
      return this.errorHandler(res, err);
    }
  };
  deleteContact = async (req, res, next) => {
    try {
      const deleteStatus = await contactsModel.removeContact(req.params.id);

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
      if (!Object.keys(req.body).length) {
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
