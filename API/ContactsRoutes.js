const { Router } = require("express");
const contactsControllers = require("./ContactsControllers");
const contactsRoutes = Router();

contactsRoutes.get("/", contactsControllers.getAllContacts);

contactsRoutes.get("/:id", contactsControllers.getContactsById);

contactsRoutes.post(
  "/",
  contactsControllers.validateNewContact,
  contactsControllers.createNewContact
);

contactsRoutes.put(
  "/:id",
  contactsControllers.validateUpdateContact,
  contactsControllers.updateContact
);

contactsRoutes.delete("/:id", contactsControllers.deleteContact);

module.exports = contactsRoutes;
