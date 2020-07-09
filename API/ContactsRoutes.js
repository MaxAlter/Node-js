const { Router } = require("express");
const contactsControllers = require("./ContactsControllers");
const contactsRoutes = Router();



contactsRoutes.get("/contacts", contactsControllers.getAllContacts);

contactsRoutes.get("/contacts/:id", contactsControllers.getContactsById);

contactsRoutes.post(
  "/contacts",
  contactsControllers.validateNewContact,
  contactsControllers.createNewContact
);

contactsRoutes.patch(
  "/contacts/:id",
  contactsControllers.validateUpdateContact,
  contactsControllers.updateContact
);

contactsRoutes.delete("/contacts/:id", contactsControllers.deleteContact);

module.exports = contactsRoutes;
